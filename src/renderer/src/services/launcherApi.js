class LauncherApiService {
    hasApi() {
        return typeof window !== 'undefined' && !!window.api;
    }
    async getAllGames() {
        if (!this.hasApi())
            return [];
        return window.api.getAllGames();
    }
    async addGame(data) {
        if (!this.hasApi()) {
            throw new Error('Electron API not available');
        }
        return window.api.addGame(data);
    }
    async updateGame(id, updates) {
        if (!this.hasApi())
            return null;
        return window.api.updateGame(id, updates);
    }
    async removeGame(id) {
        if (!this.hasApi())
            return false;
        return window.api.removeGame(id);
    }
    async launchGame(id) {
        if (!this.hasApi()) {
            return { success: false, error: 'Electron API is not available.' };
        }
        return window.api.launchGame(id);
    }
    async terminateGame(id) {
        if (!this.hasApi())
            return false;
        return window.api.terminateGame(id);
    }
    async getRunningGameIds() {
        if (!this.hasApi())
            return [];
        return window.api.getRunningGameIds();
    }
    async selectExecutable() {
        if (!this.hasApi())
            return null;
        return window.api.selectFile();
    }
    async selectCoverImage() {
        if (!this.hasApi())
            return null;
        return window.api.selectImage();
    }
    async selectDirectory() {
        if (!this.hasApi())
            return null;
        return window.api.selectDirectory();
    }
    async getSettings() {
        if (!this.hasApi()) {
            return {
                autoLaunch: false,
                minimizeToTray: false,
                startMinimized: false,
                defaultLibraryPath: 'C:\\Games',
                theme: 'solar-amber',
                animationsEnabled: true
            };
        }
        return window.api.getSettings();
    }
    async updateSettings(settings) {
        if (!this.hasApi()) {
            return {
                autoLaunch: false,
                minimizeToTray: false,
                startMinimized: false,
                defaultLibraryPath: 'C:\\Games',
                theme: 'solar-amber',
                animationsEnabled: true,
                ...settings
            };
        }
        return window.api.updateSettings(settings);
    }
    async getTelemetry() {
        if (!this.hasApi())
            return null;
        return window.api.getTelemetry();
    }
    async readImageData(filePath) {
        if (!this.hasApi())
            return null;
        return window.api.readImageData(filePath);
    }
    minimizeWindow() {
        if (this.hasApi())
            window.api.minimizeWindow();
    }
    maximizeWindow() {
        if (this.hasApi())
            window.api.maximizeWindow();
    }
    closeWindow() {
        if (this.hasApi())
            window.api.closeWindow();
    }
    isMaximized() {
        if (!this.hasApi())
            return Promise.resolve(false);
        return window.api.isMaximized();
    }
    onGameStarted(callback) {
        if (!this.hasApi())
            return () => { };
        return window.api.onGameStarted(callback);
    }
    onGameStopped(callback) {
        if (!this.hasApi())
            return () => { };
        return window.api.onGameStopped(callback);
    }
    onGameError(callback) {
        if (!this.hasApi())
            return () => { };
        return window.api.onGameError(callback);
    }
    onMaximizeChanged(callback) {
        if (!this.hasApi())
            return () => { };
        return window.api.onMaximizeChanged(callback);
    }
}
export const launcherApi = new LauncherApiService();
