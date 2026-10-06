import React from 'react';
import { Game } from '../types/game';
interface HomeProps {
    games: Game[];
    runningIds: string[];
    onLaunch: (gameId: string) => void;
    onTerminate: (gameId: string) => void;
    onToggleFavorite: (game: Game) => void;
    onRequestRemove: (game: Game) => void;
    onOpenAddModal: () => void;
    onNavigateToLibrary: () => void;
}
export declare const Home: React.FC<HomeProps>;
export {};
