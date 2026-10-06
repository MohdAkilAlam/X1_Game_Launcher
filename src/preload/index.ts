import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

// Custom APIs for renderer
const api = {
  // Games
  getAllGames: (): Promise<Game[]> => ipcRenderer.invoke('games:get-all'),
  addGame: (data: AddGameInput): Promise<Game> => ipcRenderer.invoke('games:add', data),
  updateGame: (id: string, updates: Partial<Game>): Promise<Game | null> =>
    ipcRenderer.invoke('games:update', { id, updates }),
  removeGame: (id: string): Promise<boolean> => ipcRenderer.invoke('games:remove', id),
  launchGame: (id: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('games:launch', id),
  terminateGame: (id: string): Promise<boolean> => ipcRenderer.invoke('games:terminate', id),
  getRunningGameIds: (): Promise<string[]> => ipcRenderer.invoke('games:get-running-ids'),

  // Metadata & Artwork Detection
  detectGame: (executablePath: string): Promise<GameDetectionResult> =>
    ipcRenderer.invoke('metadata:detect-game', executablePath),
  searchGameMetadata: (query: string): Promise<GameMetadataResult[]> =>
    ipcRenderer.invoke('metadata:search', query),
  downloadCover: (
    url: string,
    gameName: string,
    gameId?: string,
    forceRefresh?: boolean
  ): Promise<string | null> =>
    ipcRenderer.invoke('metadata:download-cover', { url, gameName, gameId, forceRefresh }),
  changeGameArtwork: (data: {
    gameId: string
    coverUrl?: string
    localImagePath?: string
    metadata?: Partial<Game>
  }): Promise<Game | null> => ipcRenderer.invoke('games:change-artwork', data),
  refreshGameArtwork: (
    gameId: string
  ): Promise<{ results: GameMetadataResult[]; query: string }> =>
    ipcRenderer.invoke('games:refresh-artwork', gameId),

  // Dialogs
  selectFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:select-file'),
  selectImage: (): Promise<string | null> => ipcRenderer.invoke('dialog:select-image'),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('dialog:select-directory'),

  // Settings & System
  getSettings: (): Promise<LauncherSettings> => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Partial<LauncherSettings>): Promise<LauncherSettings> =>
    ipcRenderer.invoke('settings:update', settings),
  getTelemetry: (): Promise<SystemTelemetry> => ipcRenderer.invoke('system:get-telemetry'),
  readImageData: (filePath: string): Promise<string | null> =>
    ipcRenderer.invoke('system:read-image-data', filePath),

  // Window Controls
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),

  // Event Listeners
  onGameStarted: (callback: (data: { gameId: string }) => void): (() => void) => {
    const handler = (_: IpcRendererEvent, data: { gameId: string }): void => callback(data)
    ipcRenderer.on('game:started', handler)
    return () => ipcRenderer.removeListener('game:started', handler)
  },
  onGameStopped: (
    callback: (data: { gameId: string; playTime: number; lastPlayed: number }) => void
  ): (() => void) => {
    const handler = (
      _: IpcRendererEvent,
      data: { gameId: string; playTime: number; lastPlayed: number }
    ): void => callback(data)
    ipcRenderer.on('game:stopped', handler)
    return () => ipcRenderer.removeListener('game:stopped', handler)
  },
  onGameError: (callback: (data: { gameId: string; error: string }) => void): (() => void) => {
    const handler = (_: IpcRendererEvent, data: { gameId: string; error: string }): void =>
      callback(data)
    ipcRenderer.on('game:launch-error', handler)
    return () => ipcRenderer.removeListener('game:launch-error', handler)
  },
  onMaximizeChanged: (callback: (isMax: boolean) => void): (() => void) => {
    const handler = (_: IpcRendererEvent, isMax: boolean): void => callback(isMax)
    ipcRenderer.on('window:maximize-changed', handler)
    return () => ipcRenderer.removeListener('window:maximize-changed', handler)
  }
}

export type LauncherApi = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
