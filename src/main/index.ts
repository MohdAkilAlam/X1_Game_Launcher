import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join, extname, normalize } from 'path'
import { existsSync, readFileSync } from 'fs'
import { pathToFileURL } from 'url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerGameHandlers } from './ipc/gameHandlers'
import { registerSettingsHandlers } from './ipc/settingsHandlers'
import { registerMetadataHandlers } from './ipc/metadataHandlers'

let mainWindow: BrowserWindow | null = null

function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

// Register custom protocol for local game covers and assets
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'x1-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    frame: false, // Sleek frameless design with custom titlebar
    backgroundColor: '#07080b',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximize-changed', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximize-changed', false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.x1launcher.app')

  // Register media handler for local cover images
  protocol.handle('x1-media', (request) => {
    try {
      const parsed = new URL(request.url)
      // Check query parameter format: x1-media://artwork/?path=...
      let resolvedPath = parsed.searchParams.get('path')

      if (!resolvedPath) {
        // Robust fallback for direct/legacy URL formats
        if (/^[a-zA-Z]$/.test(parsed.host)) {
          // Chromium parsed "x1-media:///C:/path" as host = "c", pathname = "/path"
          resolvedPath = `${parsed.host.toUpperCase()}:${decodeURIComponent(parsed.pathname)}`
        } else {
          const raw = decodeURIComponent(request.url.replace(/^x1-media:\/\//, ''))
          resolvedPath = raw.replace(/^\/([a-zA-Z]:)/, '$1')
        }
      }

      if (resolvedPath) {
        const normalized = normalize(resolvedPath)
        if (existsSync(normalized)) {
          return net.fetch(pathToFileURL(normalized).toString())
        }
      }
    } catch (err) {
      console.error('[x1-media] Error serving media:', err)
    }
    return new Response('Not found', { status: 404 })
  })

  // IPC image data fallback
  ipcMain.handle('system:read-image-data', async (_, filePath: string) => {
    try {
      if (!filePath || !existsSync(filePath)) return null
      const ext = extname(filePath).toLowerCase().replace('.', '')
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
      const data = readFileSync(filePath)
      return `data:${mime};base64,${data.toString('base64')}`
    } catch {
      return null
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register our modular IPC handlers
  registerGameHandlers(getMainWindow)
  registerSettingsHandlers(getMainWindow)
  registerMetadataHandlers()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
