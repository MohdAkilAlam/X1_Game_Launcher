import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
// Custom APIs for renderer
const api = {
    // Games
    getAllGames: () => ipcRenderer.invoke('games:get-all'),
    addGame: (data) => ipcRenderer.invoke('games:add', data),
    updateGame: (id, updates) => ipcRenderer.invoke('games:update', { id, updates }),
    removeGame: (id) => ipcRenderer.invoke('games:remove', id),
    launchGame: (id) => ipcRenderer.invoke('games:launch', id),
    terminateGame: (id) => ipcRenderer.invoke('games:terminate', id),
    getRunningGameIds: () => ipcRenderer.invoke('games:get-running-ids'),
    // Dialogs
    selectFile: () => ipcRenderer.invoke('dialog:select-file'),
    selectImage: () => ipcRenderer.invoke('dialog:select-image'),
    selectDirectory: () => ipcRenderer.invoke('dialog:select-directory'),
    // Settings & System
    getSettings: () => ipcRenderer.invoke('settings:get'),
    updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
    getTelemetry: () => ipcRenderer.invoke('system:get-telemetry'),
    readImageData: (filePath) => ipcRenderer.invoke('system:read-image-data', filePath),
    // Window Controls
    minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
    closeWindow: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    // Event Listeners
    onGameStarted: (callback) => {
        const handler = (_, data) => callback(data);
        ipcRenderer.on('game:started', handler);
        return () => ipcRenderer.removeListener('game:started', handler);
    },
    onGameStopped: (callback) => {
        const handler = (_, data) => callback(data);
        ipcRenderer.on('game:stopped', handler);
        return () => ipcRenderer.removeListener('game:stopped', handler);
    },
    onGameError: (callback) => {
        const handler = (_, data) => callback(data);
        ipcRenderer.on('game:launch-error', handler);
        return () => ipcRenderer.removeListener('game:launch-error', handler);
    },
    onMaximizeChanged: (callback) => {
        const handler = (_, isMax) => callback(isMax);
        ipcRenderer.on('window:maximize-changed', handler);
        return () => ipcRenderer.removeListener('window:maximize-changed', handler);
    }
};
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI);
        contextBridge.exposeInMainWorld('api', api);
    }
    catch (error) {
        console.error(error);
    }
}
else {
    // @ts-ignore
    window.electron = electronAPI;
    // @ts-ignore
    window.api = api;
}
