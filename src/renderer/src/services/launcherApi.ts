import {
  Game,
  AddGameInput,
  LauncherSettings,
  SystemTelemetry,
  GameMetadataResult,
  GameDetectionResult
} from '../types/game'

class LauncherApiService {
  private hasApi(): boolean {
    return typeof window !== 'undefined' && !!window.api
  }

  public async getAllGames(): Promise<Game[]> {
    if (!this.hasApi()) return []
    return window.api.getAllGames()
  }

  public async addGame(data: AddGameInput): Promise<Game> {
    if (!this.hasApi()) {
      throw new Error('Electron API not available')
    }
    return window.api.addGame(data)
  }

  public async updateGame(id: string, updates: Partial<Game>): Promise<Game | null> {
    if (!this.hasApi()) return null
    return window.api.updateGame(id, updates)
  }

  public async removeGame(id: string): Promise<boolean> {
    if (!this.hasApi()) return false
    return window.api.removeGame(id)
  }

  public async launchGame(id: string): Promise<{ success: boolean; error?: string }> {
    if (!this.hasApi()) {
      return { success: false, error: 'Electron API is not available.' }
    }
    return window.api.launchGame(id)
  }

  public async terminateGame(id: string): Promise<boolean> {
    if (!this.hasApi()) return false
    return window.api.terminateGame(id)
  }

  public async getRunningGameIds(): Promise<string[]> {
    if (!this.hasApi()) return []
    return window.api.getRunningGameIds()
  }

  // Metadata & Automatic Detection
  public async detectGame(executablePath: string): Promise<GameDetectionResult> {
    if (!this.hasApi()) {
      return { query: '', candidateQueries: [], detectedName: '', results: [] }
    }
    return window.api.detectGame(executablePath)
  }

  public async searchGameMetadata(query: string): Promise<GameMetadataResult[]> {
    if (!this.hasApi()) return []
    return window.api.searchGameMetadata(query)
  }

  public async downloadCover(
    url: string,
    gameName: string,
    gameId?: string,
    forceRefresh?: boolean
  ): Promise<string | null> {
    if (!this.hasApi()) return null
    return window.api.downloadCover(url, gameName, gameId, forceRefresh)
  }

  public async changeGameArtwork(data: {
    gameId: string
    coverUrl?: string
    localImagePath?: string
    metadata?: Partial<Game>
  }): Promise<Game | null> {
    if (!this.hasApi()) return null
    return window.api.changeGameArtwork(data)
  }

  public async refreshGameArtwork(
    gameId: string
  ): Promise<{ results: GameMetadataResult[]; query: string }> {
    if (!this.hasApi()) return { results: [], query: '' }
    return window.api.refreshGameArtwork(gameId)
  }

  // Native Dialogs
  public async selectExecutable(): Promise<string | null> {
    if (!this.hasApi()) return null
    return window.api.selectFile()
  }

  public async selectCoverImage(): Promise<string | null> {
    if (!this.hasApi()) return null
    return window.api.selectImage()
  }

  public async selectDirectory(): Promise<string | null> {
    if (!this.hasApi()) return null
    return window.api.selectDirectory()
  }

  // Settings & System
  public async getSettings(): Promise<LauncherSettings> {
    if (!this.hasApi()) {
      return {
        autoLaunch: false,
        minimizeToTray: false,
        startMinimized: false,
        defaultLibraryPath: 'C:\\Games',
        theme: 'solar-amber',
        animationsEnabled: true
      }
    }
    return window.api.getSettings()
  }

  public async updateSettings(settings: Partial<LauncherSettings>): Promise<LauncherSettings> {
    if (!this.hasApi()) {
      return {
        autoLaunch: false,
        minimizeToTray: false,
        startMinimized: false,
        defaultLibraryPath: 'C:\\Games',
        theme: 'solar-amber',
        animationsEnabled: true,
        ...settings
      }
    }
    return window.api.updateSettings(settings)
  }

  public async getTelemetry(): Promise<SystemTelemetry | null> {
    if (!this.hasApi()) return null
    return window.api.getTelemetry()
  }

  public async readImageData(filePath: string): Promise<string | null> {
    if (!this.hasApi()) return null
    return window.api.readImageData(filePath)
  }

  public minimizeWindow(): void {
    if (this.hasApi()) window.api.minimizeWindow()
  }

  public maximizeWindow(): void {
    if (this.hasApi()) window.api.maximizeWindow()
  }

  public closeWindow(): void {
    if (this.hasApi()) window.api.closeWindow()
  }

  public isMaximized(): Promise<boolean> {
    if (!this.hasApi()) return Promise.resolve(false)
    return window.api.isMaximized()
  }

  public onGameStarted(callback: (data: { gameId: string }) => void): () => void {
    if (!this.hasApi()) return () => {}
    return window.api.onGameStarted(callback)
  }

  public onGameStopped(
    callback: (data: { gameId: string; playTime: number; lastPlayed: number }) => void
  ): () => void {
    if (!this.hasApi()) return () => {}
    return window.api.onGameStopped(callback)
  }

  public onGameError(callback: (data: { gameId: string; error: string }) => void): () => void {
    if (!this.hasApi()) return () => {}
    return window.api.onGameError(callback)
  }

  public onMaximizeChanged(callback: (isMax: boolean) => void): () => void {
    if (!this.hasApi()) return () => {}
    return window.api.onMaximizeChanged(callback)
  }
}

export const launcherApi = new LauncherApiService()
