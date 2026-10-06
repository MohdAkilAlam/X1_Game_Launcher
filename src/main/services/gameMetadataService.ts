import { execFile } from 'child_process'
import { basename, dirname } from 'path'
import { existsSync } from 'fs'

export interface GameMetadataResult {
  id: string
  name: string
  coverUrl?: string
  developer?: string
  publisher?: string
  releaseDate?: string
  description?: string
  source: 'steam' | 'igdb' | 'custom'
}

export interface GameIdentification {
  query: string
  candidateQueries: string[]
  detectedName: string
  folderName: string
  exeName: string
  productName?: string
}

export class GameMetadataService {
  private igdbToken: { accessToken: string; expiresAt: number } | null = null

  private genericExeNames = new Set([
    'game',
    'launcher',
    'client',
    'shipping',
    'start',
    'play',
    'main',
    'run',
    'boot',
    'loader',
    'app',
    'unrealcefsubprocessor',
    'crashpad_handler',
    'unitycrashhandler64',
    'unitycrashhandler32',
    'directx',
    'setup'
  ])

  private genericFolderNames = new Set([
    'bin',
    'binaries',
    'win64',
    'win32',
    'x64',
    'x86',
    'game',
    'games',
    'retail',
    'shipping',
    'release',
    'build',
    'engine',
    'content',
    'common',
    'app',
    'launcher',
    'steamapps',
    'program files',
    'program files (x86)'
  ])

  /**
   * Extract Windows PE metadata (ProductName, FileDescription) from executable if possible.
   */
  private async getWindowsExecutableMetadata(
    filePath: string
  ): Promise<{ productName?: string; fileDescription?: string }> {
    if (process.platform !== 'win32' || !existsSync(filePath)) {
      return {}
    }

    return new Promise((resolve) => {
      const escaped = filePath.replace(/'/g, "''")
      const psCommand = `try { (Get-Item -LiteralPath '${escaped}').VersionInfo | Select-Object -Property FileDescription, ProductName | ConvertTo-Json } catch { '' }`

      execFile(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command', psCommand],
        { timeout: 2500 },
        (error, stdout) => {
          if (error || !stdout.trim()) {
            resolve({})
            return
          }

          try {
            const data = JSON.parse(stdout)
            const prod = data.ProductName?.trim()
            const desc = data.FileDescription?.trim()

            // Filter out OS generic names
            const ignoreList = [
              'microsoft® windows® operating system',
              'unreal engine',
              'unity player',
              'electron',
              'directx'
            ]

            const cleanProd =
              prod && !ignoreList.some((ig) => prod.toLowerCase().includes(ig)) ? prod : undefined
            const cleanDesc =
              desc && !ignoreList.some((ig) => desc.toLowerCase().includes(ig)) ? desc : undefined

            resolve({ productName: cleanProd, fileDescription: cleanDesc })
          } catch {
            resolve({})
          }
        }
      )
    })
  }

  /**
   * Cleans a raw filename into a searchable title.
   * e.g., "eldenring" -> "Elden Ring", "Cyberpunk2077_x64" -> "Cyberpunk 2077"
   */
  private cleanName(raw: string): string {
    return raw
      .replace(/\.[^/.]+$/, '') // strip extension
      .replace(/[-_]?(x64|x86|win64|win32|shipping|retail|dx11|dx12|repack|setup|v\d+.*)$/i, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
      .replace(/[._-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Collects multiple identification signals from the executable path:
   * - Executable filename
   * - Parent folder
   * - Installation folder (skipping generic bin/game/x64 directories)
   * - Windows PE FileVersionInfo
   */
  public async identifyGame(executablePath: string): Promise<GameIdentification> {
    const rawExe = basename(executablePath)
    const baseExeName = rawExe.replace(/\.[^/.]+$/, '').toLowerCase()
    const cleanedExe = this.cleanName(rawExe)

    // Traverse directory tree upwards to find real game folder
    const parts = executablePath.split(/[\\/]/).filter(Boolean)
    let primaryFolder = ''
    const folderCandidates: string[] = []

    for (let i = parts.length - 2; i >= 0; i--) {
      const folder = parts[i].trim()
      if (!this.genericFolderNames.has(folder.toLowerCase()) && !/^[a-zA-Z]:$/.test(folder)) {
        folderCandidates.push(folder)
      }
    }

    if (folderCandidates.length > 0) {
      primaryFolder = folderCandidates[0]
    } else {
      primaryFolder = basename(dirname(executablePath))
    }

    // Windows PE version info check
    const peInfo = await this.getWindowsExecutableMetadata(executablePath)

    const isGenericExe = this.genericExeNames.has(baseExeName)

    // Determine query priority
    const candidates: string[] = []

    if (primaryFolder) {
      candidates.push(primaryFolder)
    }

    if (peInfo.productName && !candidates.includes(peInfo.productName)) {
      candidates.push(peInfo.productName)
    }

    if (peInfo.fileDescription && !candidates.includes(peInfo.fileDescription)) {
      candidates.push(peInfo.fileDescription)
    }

    if (!isGenericExe && cleanedExe && !candidates.includes(cleanedExe)) {
      candidates.push(cleanedExe)
    }

    // If exe is generic (e.g. game.exe, shipping.exe), primary query MUST be the folder
    let bestQuery = primaryFolder
    if (!isGenericExe && !bestQuery) {
      bestQuery = cleanedExe
    } else if (!isGenericExe && peInfo.productName) {
      bestQuery = peInfo.productName
    }

    if (!bestQuery && candidates.length > 0) {
      bestQuery = candidates[0]
    }

    return {
      query: bestQuery || cleanedExe || 'Game',
      candidateQueries: candidates.length > 0 ? candidates : [cleanedExe || 'Game'],
      detectedName: primaryFolder || cleanedExe || 'Game',
      folderName: primaryFolder,
      exeName: cleanedExe,
      productName: peInfo.productName
    }
  }

  /**
   * Search IGDB API if credentials are provided in environment or configuration.
   */
  private async searchIgdb(query: string): Promise<GameMetadataResult[]> {
    const clientId = process.env.IGDB_CLIENT_ID
    const clientSecret = process.env.IGDB_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return []
    }

    try {
      // Get OAuth token if needed
      const now = Date.now()
      if (!this.igdbToken || this.igdbToken.expiresAt < now) {
        const tokenRes = await fetch(
          `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
          { method: 'POST' }
        )
        if (!tokenRes.ok) return []
        const tokenData = await tokenRes.json()
        this.igdbToken = {
          accessToken: tokenData.access_token,
          expiresAt: now + (tokenData.expires_in - 60) * 1000
        }
      }

      const body = `
        fields name, cover.image_id, summary, first_release_date, involved_companies.company.name, involved_companies.developer;
        search "${query.replace(/"/g, '')}";
        limit 8;
      `

      const res = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': clientId,
          Authorization: `Bearer ${this.igdbToken.accessToken}`,
          'Content-Type': 'text/plain'
        },
        body
      })

      if (!res.ok) return []
      const games = await res.json()

      return games.map((g: any) => {
        let releaseYear = ''
        if (g.first_release_date) {
          releaseYear = new Date(g.first_release_date * 1000).getFullYear().toString()
        }

        let dev = ''
        if (Array.isArray(g.involved_companies)) {
          const devCompany = g.involved_companies.find((c: any) => c.developer)
          if (devCompany?.company?.name) {
            dev = devCompany.company.name
          }
        }

        const coverUrl = g.cover?.image_id
          ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
          : undefined

        return {
          id: String(g.id),
          name: g.name,
          coverUrl,
          developer: dev,
          releaseDate: releaseYear,
          description: g.summary,
          source: 'igdb' as const
        }
      })
    } catch (err) {
      console.warn('[GameMetadataService] IGDB search failed, falling back:', err)
      return []
    }
  }

  /**
   * Search Steam Store API (zero-config, high-resolution vertical cover art, accurate metadata).
   */
  private async searchSteam(query: string): Promise<GameMetadataResult[]> {
    if (!query || !query.trim()) return []

    try {
      const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query.trim())}&l=english&cc=US`
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) X1Launcher/1.0'
        }
      })

      if (!res.ok) return []
      const data = await res.json()
      const items = (data.items || []).filter((item: any) => item.type === 'app').slice(0, 6)

      if (items.length === 0) return []

      const results = await Promise.all(
        items.map(async (item: any): Promise<GameMetadataResult> => {
          let developer = ''
          let publisher = ''
          let releaseDate = ''
          let description = ''

          try {
            const detailsRes = await fetch(
              `https://store.steampowered.com/api/appdetails?appids=${item.id}`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) X1Launcher/1.0'
                }
              }
            )

            if (detailsRes.ok) {
              const detailsJson = await detailsRes.json()
              const appData = detailsJson[item.id]?.data
              if (appData) {
                developer = (appData.developers || []).join(', ')
                publisher = (appData.publishers || []).join(', ')
                releaseDate = appData.release_date?.date || ''
                description = appData.short_description || ''
              }
            }
          } catch {
            // Non-critical, continue with basic details
          }

          // Steam 600x900 vertical cover URL
          const coverUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/library_600x900_2x.jpg`

          return {
            id: String(item.id),
            name: item.name,
            coverUrl,
            developer,
            publisher,
            releaseDate,
            description,
            source: 'steam'
          }
        })
      )

      return results
    } catch (err) {
      console.error('[GameMetadataService] Steam store search failed:', err)
      return []
    }
  }

  /**
   * Search metadata API for game query. Prefers IGDB if configured, falls back to Steam.
   */
  public async searchGame(query: string): Promise<GameMetadataResult[]> {
    if (!query || !query.trim()) return []

    // 1. Try IGDB if credentials exist
    const igdbResults = await this.searchIgdb(query)
    if (igdbResults.length > 0) {
      return igdbResults
    }

    // 2. Default & Fallback: Steam Store API
    return this.searchSteam(query)
  }

  /**
   * Automatic identification and search for a given executable path.
   * Tries primary and secondary signals until results are found.
   */
  public async identifyAndSearch(executablePath: string): Promise<{
    query: string
    candidateQueries: string[]
    detectedName: string
    results: GameMetadataResult[]
  }> {
    const identification = await this.identifyGame(executablePath)

    let results: GameMetadataResult[] = []

    // Try primary candidate
    for (const candidate of identification.candidateQueries) {
      results = await this.searchGame(candidate)
      if (results.length > 0) {
        return {
          query: candidate,
          candidateQueries: identification.candidateQueries,
          detectedName: identification.detectedName,
          results
        }
      }
    }

    return {
      query: identification.query,
      candidateQueries: identification.candidateQueries,
      detectedName: identification.detectedName,
      results: []
    }
  }
}

export const gameMetadataService = new GameMetadataService()
