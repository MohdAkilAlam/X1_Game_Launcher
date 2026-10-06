import { ipcMain, dialog, BrowserWindow } from 'electron'
import { gameService } from '../services/gameService'
import { processService } from '../services/processService'

export function registerGameHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle('games:get-all', () => {
    return gameService.getAllGames()
  })

  ipcMain.handle('games:add', (_, input) => {
    return gameService.addGame(input)
  })

  ipcMain.handle('games:update', (_, { id, updates }) => {
    return gameService.updateGame(id, updates)
  })

  ipcMain.handle('games:remove', (_, id: string) => {
    return gameService.removeGame(id)
  })

  ipcMain.handle('games:launch', (_, id: string) => {
    const game = gameService.getGameById(id)
    if (!game) {
      return { success: false, error: 'Game not found in library.' }
    }
    const win = getMainWindow()
    return processService.launchGame(game, win)
  })

  ipcMain.handle('games:terminate', (_, id: string) => {
    return processService.terminateGame(id)
  })

  ipcMain.handle('games:get-running-ids', () => {
    return processService.getRunningGameIds()
  })

  ipcMain.handle('dialog:select-file', async () => {
    const win = getMainWindow()
    const result = await dialog.showOpenDialog(win || undefined as any, {
      title: 'Select Game Executable',
      properties: ['openFile'],
      filters: [
        { name: 'Executables (*.exe, *.bat, *.cmd)', extensions: ['exe', 'bat', 'cmd'] },
        { name: 'All Files (*.*)', extensions: ['*'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:select-image', async () => {
    const win = getMainWindow()
    const result = await dialog.showOpenDialog(win || undefined as any, {
      title: 'Select Cover Image',
      properties: ['openFile'],
      filters: [
        { name: 'Images (*.png, *.jpg, *.jpeg, *.webp)', extensions: ['png', 'jpg', 'jpeg', 'webp'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:select-directory', async () => {
    const win = getMainWindow()
    const result = await dialog.showOpenDialog(win || undefined as any, {
      title: 'Select Game Library Folder',
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })
}
