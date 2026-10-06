import { jsx as _jsx } from "react/jsx-runtime";
import { GameCard } from './GameCard';
export const GameGrid = ({ games, runningIds, onLaunch, onTerminate, onToggleFavorite, onRequestRemove }) => {
    return (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5", children: games.map((game) => (_jsx(GameCard, { game: game, isRunning: runningIds.includes(game.id), onLaunch: onLaunch, onTerminate: onTerminate, onToggleFavorite: onToggleFavorite, onRequestRemove: onRequestRemove }, game.id))) }));
};
