import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { ArrowUpDown, Gamepad2 } from 'lucide-react';
import { GameGrid } from '../components/GameGrid';
import { EmptyState } from '../components/EmptyState';
export const Library = ({ games, runningIds, searchQuery, activeFilter, onLaunch, onTerminate, onToggleFavorite, onRequestRemove, onOpenAddModal, onClearSearch }) => {
    const [sortBy, setSortBy] = useState('recent');
    // Filter games based on search query and active tab filter
    const filteredGames = useMemo(() => {
        let result = [...games];
        // Tab filter
        if (activeFilter === 'favorites') {
            result = result.filter((g) => g.favorite);
        }
        else if (activeFilter === 'installed') {
            // All added games in V0.1 are local installed executables
            result = result.filter((g) => !!g.executablePath);
        }
        // Search query filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter((g) => g.name.toLowerCase().includes(q) || (g.platform && g.platform.toLowerCase().includes(q)));
        }
        // Sort order
        result.sort((a, b) => {
            if (sortBy === 'recent') {
                return (b.lastPlayed || 0) - (a.lastPlayed || 0);
            }
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === 'playtime') {
                return (b.playTime || 0) - (a.playTime || 0);
            }
            if (sortBy === 'added') {
                return b.dateAdded - a.dateAdded;
            }
            return 0;
        });
        return result;
    }, [games, activeFilter, searchQuery, sortBy]);
    if (games.length === 0) {
        return _jsx(EmptyState, { onOpenAddModal: onOpenAddModal });
    }
    return (_jsxs("div", { className: "space-y-6 pb-12 animate-fade-in", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center", children: _jsx(Gamepad2, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h1", { className: "font-headline text-xl font-bold text-on-surface", children: "Game Library" }), _jsxs("p", { className: "text-xs font-mono text-on-surface-variant", children: ["Showing ", filteredGames.length, " of ", games.length, " total titles"] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(ArrowUpDown, { className: "w-3.5 h-3.5 text-on-surface-variant" }), _jsx("span", { className: "text-xs font-mono text-on-surface-variant", children: "Sort:" }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "bg-surface-container-low border border-outline-variant text-on-surface text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-primary-container", children: [_jsx("option", { value: "recent", children: "Recently Played" }), _jsx("option", { value: "name", children: "Alphabetical (A-Z)" }), _jsx("option", { value: "playtime", children: "Most Played" }), _jsx("option", { value: "added", children: "Recently Added" })] })] })] }), filteredGames.length > 0 ? (_jsx(GameGrid, { games: filteredGames, runningIds: runningIds, onLaunch: onLaunch, onTerminate: onTerminate, onToggleFavorite: onToggleFavorite, onRequestRemove: onRequestRemove })) : (_jsx(EmptyState, { isSearchEmpty: true, searchQuery: searchQuery, onClearSearch: onClearSearch, onOpenAddModal: onOpenAddModal }))] }));
};
