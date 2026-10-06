import { spawn, ChildProcess } from 'child_process'
import { existsSync } from 'fs'
import { dirname } from 'path'
import { BrowserWindow } from 'electron'
import { storageService, GameRecord } from './storageService'

interface ActiveGame {
  process: ChildProcess
  startTime: number
  gameId: string
}

export class ProcessService {
  private runningGames = new Map<string, ActiveGame>()

  public isRunning(gameId: string): boolean {
    return this.runningGames.has(gameId)
  }

  public getRunningGameIds(): string[] {
    return Array.from(this.runningGames.keys())
  }

  public launchGame(
    game: GameRecord,
    mainWindow?: BrowserWindow | null
  ): { success: boolean; error?: string } {
    if (this.isRunning(game.id)) {
      return { success: false, error: 'Game is already running.' }
    }

    if (!game.executablePath || !existsSync(game.executablePath)) {
      return {
        success: false,
        error: 'Game executable could not be found. Please check file path.'
      }
    }

    try {
      const workingDir = dirname(game.executablePath)
      const args = game.launchArguments
        ? game.launchArguments.trim().split(/\s+/).filter(Boolean)
        : []

      // Spawning detached process without shell execution to prevent arbitrary shell injection
      const child = spawn(game.executablePath, args, {
        cwd: workingDir,
        detached: true,
        stdio: 'ignore'
      })

      const startTime = Date.now()
      this.runningGames.set(game.id, {
        process: child,
        startTime,
        gameId: game.id
      })

      // Notify renderer
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('game:started', { gameId: game.id })
      }

      // Handle child exit
      child.on('exit', (code, signal) => {
        console.log(`[ProcessService] Game ${game.name} exited with code ${code}, signal ${signal}`)
        this.handleProcessTermination(game.id, startTime, mainWindow)
      })

      child.on('error', (err) => {
        console.error(`[ProcessService] Process error for ${game.name}:`, err)
        this.runningGames.delete(game.id)
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('game:launch-error', {
            gameId: game.id,
            error: `Process error: ${err.message}`
          })
        }
      })

      // Unreference so Electron doesn't wait on child to exit when closing launcher
      child.unref()

      // Update lastPlayed immediately
      storageService.updateGame(game.id, {
        lastPlayed: startTime
      })

      return { success: true }
    } catch (err: any) {
      console.error('[ProcessService] Failed to launch game:', err)
      return {
        success: false,
        error: err?.message ? `Unable to launch game: ${err.message}` : 'Unable to launch the game.'
      }
    }
  }

  private handleProcessTermination(
    gameId: string,
    startTime: number,
    mainWindow?: BrowserWindow | null
  ): void {
    if (!this.runningGames.has(gameId)) return

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000))
    this.runningGames.delete(gameId)

    const currentGame = storageService.getGameById(gameId)
    const newPlayTime = (currentGame?.playTime || 0) + elapsedSeconds
    const lastPlayed = Date.now()

    storageService.updateGame(gameId, {
      playTime: newPlayTime,
      lastPlayed
    })

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('game:stopped', {
        gameId,
        playTime: newPlayTime,
        lastPlayed
      })
    }
  }

  public terminateGame(gameId: string): boolean {
    const active = this.runningGames.get(gameId)
    if (!active) return false
    try {
      active.process.kill()
      this.runningGames.delete(gameId)
      return true
    } catch (err) {
      console.error(`[ProcessService] Error killing process ${gameId}:`, err)
      return false
    }
  }
}

export const processService = new ProcessService()
