import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sparkles, History, LayoutGrid } from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { GameGrid } from '../components/GameGrid';
import { EmptyState } from '../components/EmptyState';
export const Home = ({ games, runningIds, onLaunch, onTerminate, onToggleFavorite, onRequestRemove, onOpenAddModal, onNavigateToLibrary }) => {
    if (games.length === 0) {
        return _jsx(EmptyState, { onOpenAddModal: onOpenAddModal });
    }
    // Featured game: currently running game, or most recently played, or the first game
    const runningGame = games.find((g) => runningIds.includes(g.id));
    const sortedByRecent = [...games].sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
    const featuredGame = runningGame || sortedByRecent[0];
    // Recently played games (played at least once)
    const recentlyPlayed = games.filter((g) => g.lastPlayed !== null);
    return (_jsxs("div", { className: "space-y-10 pb-12 animate-fade-in", children: [_jsxs("section", { children: [_jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [_jsx(Sparkles, { className: "w-4 h-4 text-primary" }), _jsx("h2", { className: "text-xs font-mono font-semibold tracking-wider uppercase text-on-surface-variant", children: "Featured in Library" })] }), _jsx(HeroBanner, { game: featuredGame, isRunning: runningIds.includes(featuredGame.id), onLaunch: onLaunch, onTerminate: onTerminate })] }), recentlyPlayed.length > 0 && (_jsxs("section", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(History, { className: "w-4 h-4 text-primary" }), _jsx("h2", { className: "font-headline text-lg font-bold text-on-surface", children: "Recently Played" })] }), _jsxs("span", { className: "text-xs font-mono text-on-surface-variant", children: [recentlyPlayed.length, " ", recentlyPlayed.length === 1 ? 'game' : 'games'] })] }), _jsx(GameGrid, { games: recentlyPlayed.slice(0, 4), runningIds: runningIds, onLaunch: onLaunch, onTerminate: onTerminate, onToggleFavorite: onToggleFavorite, onRequestRemove: onRequestRemove })] })), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(LayoutGrid, { className: "w-4 h-4 text-primary" }), _jsx("h2", { className: "font-headline text-lg font-bold text-on-surface", children: "Your Collection" })] }), _jsxs("button", { onClick: onNavigateToLibrary, className: "text-xs font-mono text-primary hover:underline hover:text-amber-400 transition-colors", children: ["View all (", games.length, ") \u2192"] })] }), _jsx(GameGrid, { games: games.slice(0, 6), runningIds: runningIds, onLaunch: onLaunch, onTerminate: onTerminate, onToggleFavorite: onToggleFavorite, onRequestRemove: onRequestRemove })] })] }));
};
