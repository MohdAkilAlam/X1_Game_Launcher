import React from 'react'
import { Sparkles, History, LayoutGrid } from 'lucide-react'
import { Game } from '../types/game'
import { HeroBanner } from '../components/HeroBanner'
import { GameGrid } from '../components/GameGrid'
import { EmptyState } from '../components/EmptyState'

interface HomeProps {
  games: Game[]
  runningIds: string[]
  onLaunch: (gameId: string) => void
  onTerminate: (gameId: string) => void
  onToggleFavorite: (game: Game) => void
  onRequestRemove: (game: Game) => void
  onOpenAddModal: () => void
  onNavigateToLibrary: () => void
  onChangeArtwork?: (game: Game) => void
  onRefreshArtwork?: (game: Game) => void
}

export const Home: React.FC<HomeProps> = ({
  games,
  runningIds,
  onLaunch,
  onTerminate,
  onToggleFavorite,
  onRequestRemove,
  onOpenAddModal,
  onNavigateToLibrary,
  onChangeArtwork,
  onRefreshArtwork
}) => {
  if (games.length === 0) {
    return <EmptyState onOpenAddModal={onOpenAddModal} />
  }

  // Featured game: currently running game, or most recently played, or the first game
  const runningGame = games.find((g) => runningIds.includes(g.id))
  const sortedByRecent = [...games].sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
  const featuredGame = runningGame || sortedByRecent[0]

  // Recently played games (played at least once)
  const recentlyPlayed = games.filter((g) => g.lastPlayed !== null)

  return (
    <div className="space-y-10 pb-12 animate-fade-in">
      {/* Featured Hero Banner */}
      <section>
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-mono font-semibold tracking-wider uppercase text-on-surface-variant">
            Featured in Library
          </h2>
        </div>
        <HeroBanner
          game={featuredGame}
          isRunning={runningIds.includes(featuredGame.id)}
          onLaunch={onLaunch}
          onTerminate={onTerminate}
        />
      </section>

      {/* Recently Played Section (if any have been launched) */}
      {recentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-primary" />
              <h2 className="font-headline text-lg font-bold text-on-surface">Recently Played</h2>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">
              {recentlyPlayed.length} {recentlyPlayed.length === 1 ? 'game' : 'games'}
            </span>
          </div>
          <GameGrid
            games={recentlyPlayed.slice(0, 4)}
            runningIds={runningIds}
            onLaunch={onLaunch}
            onTerminate={onTerminate}
            onToggleFavorite={onToggleFavorite}
            onRequestRemove={onRequestRemove}
            onChangeArtwork={onChangeArtwork}
            onRefreshArtwork={onRefreshArtwork}
          />
        </section>
      )}

      {/* Complete Library Preview Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            <h2 className="font-headline text-lg font-bold text-on-surface">Your Collection</h2>
          </div>
          <button
            onClick={onNavigateToLibrary}
            className="text-xs font-mono text-primary hover:underline hover:text-amber-400 transition-colors"
          >
            View all ({games.length}) →
          </button>
        </div>
        <GameGrid
          games={games.slice(0, 6)}
          runningIds={runningIds}
          onLaunch={onLaunch}
          onTerminate={onTerminate}
          onToggleFavorite={onToggleFavorite}
          onRequestRemove={onRequestRemove}
          onChangeArtwork={onChangeArtwork}
          onRefreshArtwork={onRefreshArtwork}
        />
      </section>
    </div>
  )
}
