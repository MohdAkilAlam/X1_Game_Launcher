import React from 'react';
import { Game } from '../types/game';
interface HeroBannerProps {
    game: Game;
    isRunning: boolean;
    onLaunch: (gameId: string) => void;
    onTerminate: (gameId: string) => void;
}
export declare const HeroBanner: React.FC<HeroBannerProps>;
export {};
