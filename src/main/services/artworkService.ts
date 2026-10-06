import { app } from 'electron'
import { join, extname } from 'path'
import { existsSync, mkdirSync, writeFileSync, copyFileSync, statSync } from 'fs'

export class ArtworkService {
  private coversDir: string

  constructor() {
    this.coversDir = join(app.getPath('userData'), 'covers')
    if (!existsSync(this.coversDir)) {
      mkdirSync(this.coversDir, { recursive: true })
    }
  }

  public getCoversDirectory(): string {
    return this.coversDir
  }

  /**
   * Generates a safe, alphanumeric slug for file naming.
   * Example: "Elden Ring" -> "elden-ring"
   */
  public slugify(name: string): string {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/['"’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return slug || 'cover'
  }

  /**
   * Downloads a remote cover image and caches it locally in the userData covers directory.
   * If the file already exists with non-zero size and forceRefresh is false, returns existing path.
   */
  public async downloadAndCacheCover(
    url: string,
    gameName: string,
    gameId?: string,
    forceRefresh = false
  ): Promise<string | null> {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return null
    }

    try {
      const slug = this.slugify(gameName)
      // Determine extension from url or default to .jpg
      let ext = '.jpg'
      const cleanUrl = url.split('?')[0].split('#')[0]
      const detectedExt = extname(cleanUrl).toLowerCase()
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(detectedExt)) {
        ext = detectedExt
      }

      // Generate file name e.g. elden-ring.jpg or elden-ring-<idPrefix>.jpg if needed
      const fileName = gameId ? `${slug}-${gameId.slice(0, 8)}${ext}` : `${slug}${ext}`
      const targetPath = join(this.coversDir, fileName)

      // Cache hit check
      if (!forceRefresh && existsSync(targetPath)) {
        try {
          const stats = statSync(targetPath)
          if (stats.size > 1024) {
            // Already cached and valid file
            return targetPath
          }
        } catch {
          // Re-download if stat failed
        }
      }

      // Candidate URLs to try (in case primary 2x Steam image 404s)
      const candidateUrls = [url]
      if (url.includes('library_600x900_2x.jpg')) {
        candidateUrls.push(
          url.replace('library_600x900_2x.jpg', 'library_600x900.jpg'),
          url.replace('library_600x900_2x.jpg', 'header.jpg'),
          url.replace('library_600x900_2x.jpg', 'capsule_616x353.jpg')
        )
      }

      let buffer: Buffer | null = null

      for (const candidate of candidateUrls) {
        try {
          const res = await fetch(candidate, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) X1Launcher/1.0'
            }
          })

          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer()
            if (arrayBuffer.byteLength > 512) {
              buffer = Buffer.from(arrayBuffer)
              break
            }
          }
        } catch {
          // Continue to next candidate
        }
      }

      if (!buffer) {
        console.warn(`[ArtworkService] Failed to download artwork for "${gameName}" from: ${url}`)
        return null
      }

      if (!existsSync(this.coversDir)) {
        mkdirSync(this.coversDir, { recursive: true })
      }

      writeFileSync(targetPath, buffer)
      console.log(`[ArtworkService] Successfully cached cover for "${gameName}" at: ${targetPath}`)
      return targetPath
    } catch (err) {
      console.error(`[ArtworkService] Error downloading artwork for "${gameName}":`, err)
      return null
    }
  }

  /**
   * Copies a local user-selected image file into the application's covers directory.
   */
  public async saveLocalCover(
    sourcePath: string,
    gameName: string,
    gameId?: string
  ): Promise<string | null> {
    if (!sourcePath || !existsSync(sourcePath)) {
      return null
    }

    try {
      const slug = this.slugify(gameName)
      const ext = extname(sourcePath).toLowerCase() || '.jpg'
      const suffix = gameId ? gameId.slice(0, 8) : Date.now().toString(36)
      const targetFileName = `${slug}-${suffix}${ext}`
      const targetPath = join(this.coversDir, targetFileName)

      if (!existsSync(this.coversDir)) {
        mkdirSync(this.coversDir, { recursive: true })
      }

      copyFileSync(sourcePath, targetPath)
      console.log(`[ArtworkService] Saved local image for "${gameName}" to: ${targetPath}`)
      return targetPath
    } catch (err) {
      console.error(`[ArtworkService] Failed to copy local cover for "${gameName}":`, err)
      return null
    }
  }
}

export const artworkService = new ArtworkService()
