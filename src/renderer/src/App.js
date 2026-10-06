import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AddGameModal } from './components/AddGameModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Settings } from './pages/Settings';
import { launcherApi } from './services/launcherApi';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
export const App = () => {
    const [currentTab, setCurrentTab] = useState('home');
    const [games, setGames] = useState([]);
    const [runningIds, setRunningIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [telemetry, setTelemetry] = useState(null);
    const [settings, setSettings] = useState({
        autoLaunch: false,
        minimizeToTray: false,
        startMinimized: false,
        defaultLibraryPath: 'C:\\Games',
        theme: 'solar-amber',
        animationsEnabled: true
    });
    // Modals & Notifications
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [gameToRemove, setGameToRemove] = useState(null);
    const [toast, setToast] = useState(null);
    const showToast = useCallback((text, type = 'info') => {
        setToast({ text, type });
        setTimeout(() => {
            setToast((prev) => (prev?.text === text ? null : prev));
        }, 4000);
    }, []);
    // Load initial data
    const loadInitialData = useCallback(async () => {
        try {
            const [allGames, running, loadedSettings, telemetryData] = await Promise.all([
                launcherApi.getAllGames(),
                launcherApi.getRunningGameIds(),
                launcherApi.getSettings(),
                launcherApi.getTelemetry()
            ]);
            setGames(allGames);
            setRunningIds(running);
            if (loadedSettings)
                setSettings(loadedSettings);
            if (telemetryData)
                setTelemetry(telemetryData);
        }
        catch (err) {
            console.error('Failed to load initial data:', err);
        }
    }, []);
    useEffect(() => {
        loadInitialData();
        // Listen to game lifecycle events from Electron process
        const cleanupStarted = launcherApi.onGameStarted(({ gameId }) => {
            setRunningIds((prev) => (prev.includes(gameId) ? prev : [...prev, gameId]));
            setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, lastPlayed: Date.now() } : g)));
        });
        const cleanupStopped = launcherApi.onGameStopped(({ gameId, playTime, lastPlayed }) => {
            setRunningIds((prev) => prev.filter((id) => id !== gameId));
            setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, playTime, lastPlayed } : g)));
            showToast('Game session ended. Playtime updated.', 'info');
        });
        const cleanupError = launcherApi.onGameError(({ gameId, error }) => {
            setRunningIds((prev) => prev.filter((id) => id !== gameId));
            showToast(error || 'An error occurred while running the game.', 'error');
        });
        // Keyboard shortcut Ctrl+F / Cmd+F to focus search and jump to library
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                if (currentTab === 'settings') {
                    setCurrentTab('library');
                }
                const searchInput = document.querySelector('header input');
                searchInput?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        // Periodic telemetry refresh
        const telemetryInterval = setInterval(async () => {
            const telem = await launcherApi.getTelemetry();
            if (telem)
                setTelemetry(telem);
        }, 10000);
        return () => {
            cleanupStarted();
            cleanupStopped();
            cleanupError();
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(telemetryInterval);
        };
    }, [loadInitialData, showToast, currentTab]);
    // Launch game handler
    const handleLaunchGame = async (gameId) => {
        const game = games.find((g) => g.id === gameId);
        if (!game)
            return;
        showToast(`Launching ${game.name}...`, 'info');
        const result = await launcherApi.launchGame(gameId);
        if (!result.success) {
            showToast(result.error || 'Unable to launch the game.', 'error');
        }
    };
    // Terminate running game handler
    const handleTerminateGame = async (gameId) => {
        const success = await launcherApi.terminateGame(gameId);
        if (success) {
            setRunningIds((prev) => prev.filter((id) => id !== gameId));
            showToast('Game process stopped.', 'info');
        }
    };
    // Toggle favorite
    const handleToggleFavorite = async (game) => {
        const updated = await launcherApi.updateGame(game.id, { favorite: !game.favorite });
        if (updated) {
            setGames((prev) => prev.map((g) => (g.id === game.id ? updated : g)));
        }
    };
    // Confirm remove game
    const handleConfirmRemove = async () => {
        if (!gameToRemove)
            return;
        const id = gameToRemove.id;
        const success = await launcherApi.removeGame(id);
        if (success) {
            setGames((prev) => prev.filter((g) => g.id !== id));
            showToast(`Removed "${gameToRemove.name}" from library.`, 'success');
        }
        else {
            showToast('Failed to remove game.', 'error');
        }
        setGameToRemove(null);
    };
    // Add game success callback
    const handleGameAdded = (newGame) => {
        setGames((prev) => [newGame, ...prev]);
        showToast(`"${newGame.name}" successfully added to library!`, 'success');
    };
    // Update launcher settings
    const handleUpdateSettings = async (newSettings) => {
        const updated = await launcherApi.updateSettings(newSettings);
        setSettings(updated);
    };
    return (_jsxs("div", { className: "flex h-screen w-screen overflow-hidden bg-background text-on-surface font-sans select-none", children: [_jsx(Sidebar, { currentTab: currentTab, onSelectTab: setCurrentTab, onOpenAddModal: () => setIsAddModalOpen(true), telemetry: telemetry }), _jsxs("div", { className: "flex-1 ml-60 flex flex-col h-full overflow-hidden", children: [_jsx(TopBar, { searchQuery: searchQuery, onSearchChange: (q) => {
                            setSearchQuery(q);
                            if (q.trim() && currentTab === 'settings') {
                                setCurrentTab('library');
                            }
                        }, activeFilter: activeFilter, onFilterChange: setActiveFilter, onOpenAddModal: () => setIsAddModalOpen(true), showFilters: currentTab !== 'settings' }), _jsxs("main", { className: "flex-1 mt-14 overflow-y-auto p-8 max-w-7xl w-full mx-auto", children: [currentTab === 'home' && (_jsx(Home, { games: games, runningIds: runningIds, onLaunch: handleLaunchGame, onTerminate: handleTerminateGame, onToggleFavorite: handleToggleFavorite, onRequestRemove: (g) => setGameToRemove(g), onOpenAddModal: () => setIsAddModalOpen(true), onNavigateToLibrary: () => setCurrentTab('library') })), currentTab === 'library' && (_jsx(Library, { games: games, runningIds: runningIds, searchQuery: searchQuery, activeFilter: activeFilter, onLaunch: handleLaunchGame, onTerminate: handleTerminateGame, onToggleFavorite: handleToggleFavorite, onRequestRemove: (g) => setGameToRemove(g), onOpenAddModal: () => setIsAddModalOpen(true), onClearSearch: () => setSearchQuery('') })), currentTab === 'settings' && (_jsx(Settings, { settings: settings, onUpdateSettings: handleUpdateSettings, onRescanLibrary: () => {
                                    launcherApi.getAllGames().then(setGames);
                                    showToast('Library rescan completed.', 'success');
                                } }))] })] }), _jsx(AddGameModal, { isOpen: isAddModalOpen, onClose: () => setIsAddModalOpen(false), onGameAdded: handleGameAdded }), _jsx(ConfirmDialog, { isOpen: !!gameToRemove, title: "Remove this game from your library?", message: "The game files will not be deleted. Only its listing and telemetry in X1 Launcher will be removed.", confirmText: "Remove Game", cancelText: "Cancel", isDanger: true, onConfirm: handleConfirmRemove, onCancel: () => setGameToRemove(null) }), toast && (_jsxs("div", { className: "fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl bg-surface-container border border-outline-variant shadow-2xl animate-fade-in", children: [toast.type === 'error' && _jsx(AlertCircle, { className: "w-5 h-5 text-status-error shrink-0" }), toast.type === 'success' && (_jsx(CheckCircle, { className: "w-5 h-5 text-status-running shrink-0" })), toast.type === 'info' && _jsx(Info, { className: "w-5 h-5 text-primary shrink-0" }), _jsx("span", { className: "text-xs font-semibold text-on-surface", children: toast.text }), _jsx("button", { onClick: () => setToast(null), className: "p-1 text-on-surface-variant hover:text-on-surface", children: _jsx(X, { className: "w-3.5 h-3.5" }) })] }))] }));
};
export default App;
