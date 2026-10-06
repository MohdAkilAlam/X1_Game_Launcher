import React from 'react';
import { Game } from '../types/game';
interface LibraryProps {
    games: Game[];
    runningIds: string[];
    searchQuery: string;
    activeFilter: 'all' | 'installed' | 'favorites';
    onLaunch: (gameId: string) => void;
    onTerminate: (gameId: string) => void;
    onToggleFavorite: (game: Game) => void;
    onRequestRemove: (game: Game) => void;
    onOpenAddModal: () => void;
    onClearSearch: () => void;
}
export declare const Library: React.FC<LibraryProps>;
export {};
