import { ElectronAPI } from '@electron-toolkit/preload'

export interface Game {
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
  playTime: number
  favorite?: boolean
}

export interface AddGameInput {
  name?: string
  executablePath: string
  coverPath?: string
  coverUrl?: string
  metadataId?: string
  developer?: string
  publisher?: string
  releaseDate?: string
  description?: string
  launchArguments?: string
  platform?: string
}

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

export interface GameDetectionResult {
  query: string
  candidateQueries: string[]
  detectedName: string
  results: GameMetadataResult[]
}

export interface LauncherSettings {
  autoLaunch: boolean
  minimizeToTray: boolean
  startMinimized: boolean
  defaultLibraryPath: string
  theme: 'dark' | 'solar-amber'
  animationsEnabled: boolean
}

export interface SystemTelemetry {
  totalRamGB: string
  freeRamGB: string
  ramUsagePercent: number
  platform: string
  cpus: number
}

export interface LauncherApi {
  getAllGames: () => Promise<Game[]>
  addGame: (data: AddGameInput) => Promise<Game>
  updateGame: (id: string, updates: Partial<Game>) => Promise<Game | null>
  removeGame: (id: string) => Promise<boolean>
  launchGame: (id: string) => Promise<{ success: boolean; error?: string }>
  terminateGame: (id: string) => Promise<boolean>
  getRunningGameIds: () => Promise<string[]>

  // Metadata & Artwork Detection
  detectGame: (executablePath: string) => Promise<GameDetectionResult>
  searchGameMetadata: (query: string) => Promise<GameMetadataResult[]>
  downloadCover: (
    url: string,
    gameName: string,
    gameId?: string,
    forceRefresh?: boolean
  ) => Promise<string | null>
  changeGameArtwork: (data: {
    gameId: string
    coverUrl?: string
    localImagePath?: string
    metadata?: Partial<Game>
  }) => Promise<Game | null>
  refreshGameArtwork: (
    gameId: string
  ) => Promise<{ results: GameMetadataResult[]; query: string }>

  // Dialogs
  selectFile: () => Promise<string | null>
  selectImage: () => Promise<string | null>
  selectDirectory: () => Promise<string | null>

  // Settings & System
  getSettings: () => Promise<LauncherSettings>
  updateSettings: (settings: Partial<LauncherSettings>) => Promise<LauncherSettings>
  getTelemetry: () => Promise<SystemTelemetry>
  readImageData: (filePath: string) => Promise<string | null>

  // Window Controls
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  isMaximized: () => Promise<boolean>

  // Event Listeners
  onGameStarted: (callback: (data: { gameId: string }) => void) => () => void
  onGameStopped: (
    callback: (data: { gameId: string; playTime: number; lastPlayed: number }) => void
  ) => () => void
  onGameError: (callback: (data: { gameId: string; error: string }) => void) => () => void
  onMaximizeChanged: (callback: (isMax: boolean) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: LauncherApi
  }
}
