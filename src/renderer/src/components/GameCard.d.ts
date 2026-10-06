import React from 'react';
import { Game } from '../types/game';
interface GameCardProps {
    game: Game;
    isRunning: boolean;
    onLaunch: (gameId: string) => void;
    onTerminate: (gameId: string) => void;
    onToggleFavorite: (game: Game) => void;
    onRequestRemove: (game: Game) => void;
}
export declare const GameCard: React.FC<GameCardProps>;
export {};
