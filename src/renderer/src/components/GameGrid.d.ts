import React from 'react';
import { Game } from '../types/game';
interface GameGridProps {
    games: Game[];
    runningIds: string[];
    onLaunch: (gameId: string) => void;
    onTerminate: (gameId: string) => void;
    onToggleFavorite: (game: Game) => void;
    onRequestRemove: (game: Game) => void;
}
export declare const GameGrid: React.FC<GameGridProps>;
export {};
