import { ipcMain, BrowserWindow } from 'electron'
import { storageService, LauncherSettings } from '../services/storageService'
import * as os from 'os'

export function registerSettingsHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle('settings:get', () => {
    return storageService.getSettings()
  })

  ipcMain.handle('settings:update', (_, updates: Partial<LauncherSettings>) => {
    return storageService.updateSettings(updates)
  })

  ipcMain.handle('window:minimize', () => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      win.minimize()
    }
  })

  ipcMain.handle('window:maximize', () => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.handle('window:close', () => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      win.close()
    }
  })

  ipcMain.handle('window:is-maximized', () => {
    const win = getMainWindow()
    return win ? win.isMaximized() : false
  })

  ipcMain.handle('system:get-telemetry', () => {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    return {
      totalRamGB: (totalMem / (1024 * 1024 * 1024)).toFixed(1),
      freeRamGB: (freeMem / (1024 * 1024 * 1024)).toFixed(1),
      ramUsagePercent: Math.round((usedMem / totalMem) * 100),
      platform: os.platform(),
      cpus: os.cpus().length
    }
  })
}
