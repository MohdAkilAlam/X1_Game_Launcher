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
  playTime: number // in seconds
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
