import { ipcMain } from 'electron'
import { gameMetadataService } from '../services/gameMetadataService'
import { artworkService } from '../services/artworkService'
import { gameService } from '../services/gameService'

export function registerMetadataHandlers(): void {
  // Automatically identify game from executable path and search metadata
  ipcMain.handle('metadata:detect-game', async (_, executablePath: string) => {
    if (!executablePath || typeof executablePath !== 'string') {
      return { query: '', candidateQueries: [], detectedName: '', results: [] }
    }
    return gameMetadataService.identifyAndSearch(executablePath)
  })

  // Manual or query-based metadata search
  ipcMain.handle('metadata:search', async (_, query: string) => {
    if (!query || typeof query !== 'string') {
      return []
    }
    return gameMetadataService.searchGame(query)
  })

  // Download and cache cover
  ipcMain.handle(
    'metadata:download-cover',
    async (
      _,
      {
        url,
        gameName,
        gameId,
        forceRefresh
      }: { url: string; gameName: string; gameId?: string; forceRefresh?: boolean }
    ) => {
      return artworkService.downloadAndCacheCover(url, gameName, gameId, !!forceRefresh)
    }
  )

  // Change existing game artwork (remote URL or local file)
  ipcMain.handle(
    'games:change-artwork',
    async (
      _,
      {
        gameId,
        coverUrl,
        localImagePath,
        metadata
      }: {
        gameId: string
        coverUrl?: string
        localImagePath?: string
        metadata?: any
      }
    ) => {
      return gameService.changeArtwork(gameId, { coverUrl, localImagePath, metadata })
    }
  )

  // Refresh artwork for existing game
  ipcMain.handle('games:refresh-artwork', async (_, gameId: string) => {
    return gameService.refreshArtwork(gameId)
  })
}
