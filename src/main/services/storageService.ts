import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

export interface GameRecord {
  id: string
  name: string
  executablePath: string
  coverPath?: string
  coverUrl?: string
  metadataId?: string
  developer?: string
  publisher?: string
  releaseDate?: string
  description?: string
  launchArguments?: string
  platform: string
  dateAdded: number
  lastPlayed: number | null
  playTime: number // in seconds
  favorite?: boolean
}

export interface LauncherSettings {
  autoLaunch: boolean
  minimizeToTray: boolean
  startMinimized: boolean
  defaultLibraryPath: string
  theme: 'dark' | 'solar-amber'
  animationsEnabled: boolean
}

interface LauncherDatabase {
  version: string
  games: GameRecord[]
  settings: LauncherSettings
}

const DEFAULT_SETTINGS: LauncherSettings = {
  autoLaunch: false,
  minimizeToTray: false,
  startMinimized: false,
  defaultLibraryPath: 'C:\\Games',
  theme: 'solar-amber',
  animationsEnabled: true
}

export class StorageService {
  private dataPath: string
  private data: LauncherDatabase

  constructor() {
    const userData = app.getPath('userData')
    this.dataPath = join(userData, 'x1-launcher-data.json')
    this.data = this.loadData()
  }

  private loadData(): LauncherDatabase {
    try {
      if (existsSync(this.dataPath)) {
        const raw = readFileSync(this.dataPath, 'utf-8')
        const parsed = JSON.parse(raw)
        return {
          version: parsed.version || '0.1.0',
          games: Array.isArray(parsed.games) ? parsed.games : [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
        }
      }
    } catch (err) {
      console.error('[StorageService] Failed to load data, using default:', err)
    }

    return {
      version: '0.1.0',
      games: [],
      settings: DEFAULT_SETTINGS
    }
  }

  private saveData(): void {
    try {
      const dir = join(this.dataPath, '..')
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (err) {
      console.error('[StorageService] Failed to write data:', err)
    }
  }

  public getGames(): GameRecord[] {
    return [...this.data.games]
  }

  public getGameById(id: string): GameRecord | undefined {
    return this.data.games.find((g) => g.id === id)
  }

  public saveGame(game: GameRecord): void {
    const idx = this.data.games.findIndex((g) => g.id === game.id)
    if (idx >= 0) {
      this.data.games[idx] = game
    } else {
      this.data.games.push(game)
    }
    this.saveData()
  }

  public removeGame(id: string): boolean {
    const initialLen = this.data.games.length
    this.data.games = this.data.games.filter((g) => g.id !== id)
    if (this.data.games.length !== initialLen) {
      this.saveData()
      return true
    }
    return false
  }

  public updateGame(id: string, updates: Partial<GameRecord>): GameRecord | null {
    const game = this.getGameById(id)
    if (!game) return null
    const updated = { ...game, ...updates }
    this.saveGame(updated)
    return updated
  }

  public getSettings(): LauncherSettings {
    return { ...this.data.settings }
  }

  public updateSettings(updates: Partial<LauncherSettings>): LauncherSettings {
    this.data.settings = { ...this.data.settings, ...updates }
    this.saveData()
    return { ...this.data.settings }
  }
}

export const storageService = new StorageService()
