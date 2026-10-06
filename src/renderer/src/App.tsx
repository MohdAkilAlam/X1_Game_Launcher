import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { AddGameModal } from './components/AddGameModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ArtworkModal } from './components/ArtworkModal'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { Settings } from './pages/Settings'
import { Game, LauncherSettings, SystemTelemetry } from './types/game'
import { launcherApi } from './services/launcherApi'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'library' | 'settings'>('home')
  const [games, setGames] = useState<Game[]>([])
  const [runningIds, setRunningIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'installed' | 'favorites'>('all')
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null)
  const [settings, setSettings] = useState<LauncherSettings>({
    autoLaunch: false,
    minimizeToTray: false,
    startMinimized: false,
    defaultLibraryPath: 'C:\\Games',
    theme: 'solar-amber',
    animationsEnabled: true
  })

  // Modals & Notifications
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [gameToRemove, setGameToRemove] = useState<Game | null>(null)
  const [artworkModalGame, setArtworkModalGame] = useState<Game | null>(null)
  const [toast, setToast] = useState<{
    text: string
    type: 'error' | 'success' | 'info'
  } | null>(null)

  const showToast = useCallback((text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ text, type })
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev))
    }, 4000)
  }, [])

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [allGames, running, loadedSettings, telemetryData] = await Promise.all([
        launcherApi.getAllGames(),
        launcherApi.getRunningGameIds(),
        launcherApi.getSettings(),
        launcherApi.getTelemetry()
      ])
      setGames(allGames)
      setRunningIds(running)
      if (loadedSettings) setSettings(loadedSettings)
      if (telemetryData) setTelemetry(telemetryData)
    } catch (err) {
      console.error('Failed to load initial data:', err)
    }
  }, [])

  useEffect(() => {
    loadInitialData()

    // Listen to game lifecycle events from Electron process
    const cleanupStarted = launcherApi.onGameStarted(({ gameId }) => {
      setRunningIds((prev) => (prev.includes(gameId) ? prev : [...prev, gameId]))
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, lastPlayed: Date.now() } : g))
      )
    })

    const cleanupStopped = launcherApi.onGameStopped(({ gameId, playTime, lastPlayed }) => {
      setRunningIds((prev) => prev.filter((id) => id !== gameId))
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, playTime, lastPlayed } : g))
      )
      showToast('Game session ended. Playtime updated.', 'info')
    })

    const cleanupError = launcherApi.onGameError(({ gameId, error }) => {
      setRunningIds((prev) => prev.filter((id) => id !== gameId))
      showToast(error || 'An error occurred while running the game.', 'error')
    })

    // Keyboard shortcut Ctrl+F / Cmd+F to focus search and jump to library
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        if (currentTab === 'settings') {
          setCurrentTab('library')
        }
        const searchInput = document.querySelector('header input') as HTMLInputElement
        searchInput?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Periodic telemetry refresh
    const telemetryInterval = setInterval(async () => {
      const telem = await launcherApi.getTelemetry()
      if (telem) setTelemetry(telem)
    }, 10000)

    return () => {
      cleanupStarted()
      cleanupStopped()
      cleanupError()
      window.removeEventListener('keydown', handleKeyDown)
      clearInterval(telemetryInterval)
    }
  }, [loadInitialData, showToast, currentTab])

  // Launch game handler
  const handleLaunchGame = async (gameId: string) => {
    const game = games.find((g) => g.id === gameId)
    if (!game) return

    showToast(`Launching ${game.name}...`, 'info')
    const result = await launcherApi.launchGame(gameId)
    if (!result.success) {
      showToast(result.error || 'Unable to launch the game.', 'error')
    }
  }

  // Terminate running game handler
  const handleTerminateGame = async (gameId: string) => {
    const success = await launcherApi.terminateGame(gameId)
    if (success) {
      setRunningIds((prev) => prev.filter((id) => id !== gameId))
      showToast('Game process stopped.', 'info')
    }
  }

  // Toggle favorite
  const handleToggleFavorite = async (game: Game) => {
    const updated = await launcherApi.updateGame(game.id, { favorite: !game.favorite })
    if (updated) {
      setGames((prev) => prev.map((g) => (g.id === game.id ? updated : g)))
    }
  }

  // Confirm remove game
  const handleConfirmRemove = async () => {
    if (!gameToRemove) return
    const id = gameToRemove.id
    const success = await launcherApi.removeGame(id)
    if (success) {
      setGames((prev) => prev.filter((g) => g.id !== id))
      showToast(`Removed "${gameToRemove.name}" from library.`, 'success')
    } else {
      showToast('Failed to remove game.', 'error')
    }
    setGameToRemove(null)
  }

  // Add game success callback
  // Add game success callback
  const handleGameAdded = (newGame: Game) => {
    setGames((prev) => [newGame, ...prev])
    showToast(`"${newGame.name}" successfully added to library!`, 'success')
  }

  // Artwork update callback
  const handleArtworkUpdated = (updatedGame: Game) => {
    setGames((prev) => prev.map((g) => (g.id === updatedGame.id ? updatedGame : g)))
    showToast(`Artwork updated for "${updatedGame.name}".`, 'success')
  }

  // Update launcher settings
  const handleUpdateSettings = async (newSettings: Partial<LauncherSettings>) => {
    const updated = await launcherApi.updateSettings(newSettings)
    setSettings(updated)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface font-sans select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        telemetry={telemetry}
      />

      {/* Main App Container */}
      <div className="flex-1 ml-60 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q)
            if (q.trim() && currentTab === 'settings') {
              setCurrentTab('library')
            }
          }}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          showFilters={currentTab !== 'settings'}
        />

        {/* Viewport Content */}
        <main className="flex-1 mt-14 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'home' && (
            <Home
              games={games}
              runningIds={runningIds}
              onLaunch={handleLaunchGame}
              onTerminate={handleTerminateGame}
              onToggleFavorite={handleToggleFavorite}
              onRequestRemove={(g) => setGameToRemove(g)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onNavigateToLibrary={() => setCurrentTab('library')}
              onChangeArtwork={(g) => setArtworkModalGame(g)}
              onRefreshArtwork={(g) => setArtworkModalGame(g)}
            />
          )}

          {currentTab === 'library' && (
            <Library
              games={games}
              runningIds={runningIds}
              searchQuery={searchQuery}
              activeFilter={activeFilter}
              onLaunch={handleLaunchGame}
              onTerminate={handleTerminateGame}
              onToggleFavorite={handleToggleFavorite}
              onRequestRemove={(g) => setGameToRemove(g)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onClearSearch={() => setSearchQuery('')}
              onChangeArtwork={(g) => setArtworkModalGame(g)}
              onRefreshArtwork={(g) => setArtworkModalGame(g)}
            />
          )}

          {currentTab === 'settings' && (
            <Settings
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRescanLibrary={() => {
                launcherApi.getAllGames().then(setGames)
                showToast('Library rescan completed.', 'success')
              }}
            />
          )}
        </main>
      </div>

      {/* Add Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onGameAdded={handleGameAdded}
      />

      {/* Artwork Modal */}
      <ArtworkModal
        isOpen={!!artworkModalGame}
        game={artworkModalGame}
        onClose={() => setArtworkModalGame(null)}
        onArtworkUpdated={handleArtworkUpdated}
      />

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        isOpen={!!gameToRemove}
        title="Remove this game from your library?"
        message="The game files will not be deleted. Only its listing and telemetry in X1 Launcher will be removed."
        confirmText="Remove Game"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmRemove}
        onCancel={() => setGameToRemove(null)}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl bg-surface-container border border-outline-variant shadow-2xl animate-fade-in">
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-status-error shrink-0" />}
          {toast.type === 'success' && (
            <CheckCircle className="w-5 h-5 text-status-running shrink-0" />
          )}
          {toast.type === 'info' && <Info className="w-5 h-5 text-primary shrink-0" />}
          <span className="text-xs font-semibold text-on-surface">{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default App
