import React, { useState, useMemo } from 'react'
import { ArrowUpDown, Gamepad2 } from 'lucide-react'
import { Game } from '../types/game'
import { GameGrid } from '../components/GameGrid'
import { EmptyState } from '../components/EmptyState'

interface LibraryProps {
  games: Game[]
  runningIds: string[]
  searchQuery: string
  activeFilter: 'all' | 'installed' | 'favorites'
  onLaunch: (gameId: string) => void
  onTerminate: (gameId: string) => void
  onToggleFavorite: (game: Game) => void
  onRequestRemove: (game: Game) => void
  onOpenAddModal: () => void
  onClearSearch: () => void
  onChangeArtwork?: (game: Game) => void
  onRefreshArtwork?: (game: Game) => void
}

type SortOption = 'recent' | 'name' | 'playtime' | 'added'

export const Library: React.FC<LibraryProps> = ({
  games,
  runningIds,
  searchQuery,
  activeFilter,
  onLaunch,
  onTerminate,
  onToggleFavorite,
  onRequestRemove,
  onOpenAddModal,
  onClearSearch,
  onChangeArtwork,
  onRefreshArtwork
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  // Filter games based on search query and active tab filter
  const filteredGames = useMemo(() => {
    let result = [...games]

    // Tab filter
    if (activeFilter === 'favorites') {
      result = result.filter((g) => g.favorite)
    } else if (activeFilter === 'installed') {
      // All added games in V0.1 are local installed executables
      result = result.filter((g) => !!g.executablePath)
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (g) => g.name.toLowerCase().includes(q) || (g.platform && g.platform.toLowerCase().includes(q))
      )
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return (b.lastPlayed || 0) - (a.lastPlayed || 0)
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'playtime') {
        return (b.playTime || 0) - (a.playTime || 0)
      }
      if (sortBy === 'added') {
        return b.dateAdded - a.dateAdded
      }
      return 0
    })

    return result
  }, [games, activeFilter, searchQuery, sortBy])

  if (games.length === 0) {
    return <EmptyState onOpenAddModal={onOpenAddModal} />
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold text-on-surface">Game Library</h1>
            <p className="text-xs font-mono text-on-surface-variant">
              Showing {filteredGames.length} of {games.length} total titles
            </p>
          </div>
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-on-surface-variant" />
          <span className="text-xs font-mono text-on-surface-variant">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-surface-container-low border border-outline-variant text-on-surface text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-primary-container"
          >
            <option value="recent">Recently Played</option>
            <option value="name">Alphabetical (A-Z)</option>
            <option value="playtime">Most Played</option>
            <option value="added">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Grid or Empty Filter state */}
      {filteredGames.length > 0 ? (
        <GameGrid
          games={filteredGames}
          runningIds={runningIds}
          onLaunch={onLaunch}
          onTerminate={onTerminate}
          onToggleFavorite={onToggleFavorite}
          onRequestRemove={onRequestRemove}
          onChangeArtwork={onChangeArtwork}
          onRefreshArtwork={onRefreshArtwork}
        />
      ) : (
        <EmptyState
          isSearchEmpty={true}
          searchQuery={searchQuery}
          onClearSearch={onClearSearch}
          onOpenAddModal={onOpenAddModal}
        />
      )}
    </div>
  )
}
