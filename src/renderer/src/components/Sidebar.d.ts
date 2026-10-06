import React from 'react';
import { SystemTelemetry } from '../types/game';
interface SidebarProps {
    currentTab: 'home' | 'library' | 'settings';
    onSelectTab: (tab: 'home' | 'library' | 'settings') => void;
    onOpenAddModal: () => void;
    telemetry: SystemTelemetry | null;
}
export declare const Sidebar: React.FC<SidebarProps>;
export {};
