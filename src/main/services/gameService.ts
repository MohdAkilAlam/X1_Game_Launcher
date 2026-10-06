import { randomUUID } from 'crypto'
import { basename } from 'path'
import { existsSync } from 'fs'
import { storageService, GameRecord } from './storageService'
import { artworkService } from './artworkService'
import { gameMetadataService, GameMetadataResult } from './gameMetadataService'

export class GameService {
  public getAllGames(): GameRecord[] {
    return storageService.getGames()
  }

  public getGameById(id: string): GameRecord | undefined {
    return storageService.getGameById(id)
  }

  /**
   * Adds a new game to the library with automatic or provided cover artwork caching.
   */
  public async addGame(input: {
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
  }): Promise<GameRecord> {
    const id = randomUUID()

    // Determine fallback name from executable
    let gameName = input.name?.trim()
    if (!gameName) {
      const base = basename(input.executablePath)
      gameName = base.replace(/\.[^/.]+$/, '')
    }

    let persistedCover: string | undefined = undefined

    // 1. If a local file path was provided for cover, save it into covers directory
    if (input.coverPath && existsSync(input.coverPath)) {
      try {
        const cached = await artworkService.saveLocalCover(input.coverPath, gameName, id)
        if (cached) {
          persistedCover = cached
        }
      } catch (err) {
        console.error('[GameService] Failed to cache local cover:', err)
      }
    }
    // 2. If a remote coverUrl was provided, download and cache it locally
    else if (input.coverUrl) {
      try {
        const cached = await artworkService.downloadAndCacheCover(input.coverUrl, gameName, id)
        if (cached) {
          persistedCover = cached
        }
      } catch (err) {
        console.error('[GameService] Failed to download remote cover:', err)
      }
    }

    const newGame: GameRecord = {
      id,
      name: gameName,
      executablePath: input.executablePath,
      coverPath: persistedCover,
      coverUrl: input.coverUrl,
      metadataId: input.metadataId,
      developer: input.developer,
      publisher: input.publisher,
      releaseDate: input.releaseDate,
      description: input.description,
      launchArguments: input.launchArguments?.trim() || '',
      platform: input.platform || 'PC / Windows',
      dateAdded: Date.now(),
      lastPlayed: null,
      playTime: 0,
      favorite: false
    }

    storageService.saveGame(newGame)
    return newGame
  }

  /**
   * Updates an existing game record.
   */
  public updateGame(id: string, updates: Partial<GameRecord>): GameRecord | null {
    return storageService.updateGame(id, updates)
  }

  /**
   * Removes a game from the library database.
   * Does NOT touch the game executable or installation on disk.
   */
  public removeGame(id: string): boolean {
    return storageService.removeGame(id)
  }

  /**
   * Changes the artwork of an existing game, either from a remote URL or a local image file.
   */
  public async changeArtwork(
    gameId: string,
    options: {
      coverUrl?: string
      localImagePath?: string
      metadata?: Partial<GameRecord>
    }
  ): Promise<GameRecord | null> {
    const game = this.getGameById(gameId)
    if (!game) return null

    let newCoverPath: string | undefined = undefined

    if (options.localImagePath && existsSync(options.localImagePath)) {
      const cached = await artworkService.saveLocalCover(options.localImagePath, game.name, game.id)
      if (cached) newCoverPath = cached
    } else if (options.coverUrl) {
      const cached = await artworkService.downloadAndCacheCover(
        options.coverUrl,
        game.name,
        game.id,
        true // force refresh
      )
      if (cached) newCoverPath = cached
    }

    const updates: Partial<GameRecord> = {
      ...(options.metadata || {})
    }

    if (newCoverPath) {
      updates.coverPath = newCoverPath
      if (options.coverUrl) {
        updates.coverUrl = options.coverUrl
      }
    }

    return this.updateGame(gameId, updates)
  }

  /**
   * Refreshes metadata & artwork for an existing game.
   */
  public async refreshArtwork(
    gameId: string
  ): Promise<{ results: GameMetadataResult[]; query: string }> {
    const game = this.getGameById(gameId)
    if (!game) return { results: [], query: '' }

    const results = await gameMetadataService.searchGame(game.name)
    return { results, query: game.name }
  }
}

export const gameService = new GameService()
