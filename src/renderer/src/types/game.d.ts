export interface Game {
    id: string;
    name: string;
    executablePath: string;
    coverPath?: string;
    launchArguments?: string;
    platform: string;
    dateAdded: number;
    lastPlayed: number | null;
    playTime: number;
    favorite?: boolean;
}
export interface AddGameInput {
    name?: string;
    executablePath: string;
    coverPath?: string;
    launchArguments?: string;
    platform?: string;
}
export interface LauncherSettings {
    autoLaunch: boolean;
    minimizeToTray: boolean;
    startMinimized: boolean;
    defaultLibraryPath: string;
    theme: 'dark' | 'solar-amber';
    animationsEnabled: boolean;
}
export interface SystemTelemetry {
    totalRamGB: string;
    freeRamGB: string;
    ramUsagePercent: number;
    platform: string;
    cpus: number;
}
