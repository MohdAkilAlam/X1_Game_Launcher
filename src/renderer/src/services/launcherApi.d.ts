import { Game, AddGameInput, LauncherSettings, SystemTelemetry } from '../types/game';
declare class LauncherApiService {
    private hasApi;
    getAllGames(): Promise<Game[]>;
    addGame(data: AddGameInput): Promise<Game>;
    updateGame(id: string, updates: Partial<Game>): Promise<Game | null>;
    removeGame(id: string): Promise<boolean>;
    launchGame(id: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    terminateGame(id: string): Promise<boolean>;
    getRunningGameIds(): Promise<string[]>;
    selectExecutable(): Promise<string | null>;
    selectCoverImage(): Promise<string | null>;
    selectDirectory(): Promise<string | null>;
    getSettings(): Promise<LauncherSettings>;
    updateSettings(settings: Partial<LauncherSettings>): Promise<LauncherSettings>;
    getTelemetry(): Promise<SystemTelemetry | null>;
    readImageData(filePath: string): Promise<string | null>;
    minimizeWindow(): void;
    maximizeWindow(): void;
    closeWindow(): void;
    isMaximized(): Promise<boolean>;
    onGameStarted(callback: (data: {
        gameId: string;
    }) => void): () => void;
    onGameStopped(callback: (data: {
        gameId: string;
        playTime: number;
        lastPlayed: number;
    }) => void): () => void;
    onGameError(callback: (data: {
        gameId: string;
        error: string;
    }) => void): () => void;
    onMaximizeChanged(callback: (isMax: boolean) => void): () => void;
}
export declare const launcherApi: LauncherApiService;
export {};
