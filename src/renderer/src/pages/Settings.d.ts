import React from 'react';
import { LauncherSettings } from '../types/game';
interface SettingsProps {
    settings: LauncherSettings;
    onUpdateSettings: (newSettings: Partial<LauncherSettings>) => void;
    onRescanLibrary: () => void;
}
export declare const Settings: React.FC<SettingsProps>;
export {};
