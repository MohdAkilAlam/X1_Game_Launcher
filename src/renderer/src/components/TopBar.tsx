import React, { useEffect, useState } from 'react'
import { Search, Plus, Minus, Square, Copy, X } from 'lucide-react'
import { launcherApi } from '../services/launcherApi'

interface TopBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeFilter: 'all' | 'installed' | 'favorites'
  onFilterChange: (filter: 'all' | 'installed' | 'favorites') => void
  onOpenAddModal: () => void
  showFilters?: boolean
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onOpenAddModal,
  showFilters = true
}) => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    launcherApi.isMaximized().then(setIsMaximized)
    const cleanup = launcherApi.onMaximizeChanged(setIsMaximized)
    return () => cleanup()
  }, [])

  return (
    <header className="h-14 fixed top-0 left-60 right-0 z-20 flex items-center justify-between select-none bg-surface/95 backdrop-blur-md border-b border-primary-container/20 px-6 titlebar-drag-region">
      {/* Search & Filter Nav */}
      <div className="flex items-center space-x-6 flex-1 mr-4 titlebar-no-drag">
        {/* Search Input */}
        <div className="relative w-72 sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <Search className="w-4 h-4 text-on-surface-variant/70" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your library (Ctrl + F)..."
            className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary-container focus:ring-1 focus:ring-primary-container text-on-surface placeholder:text-on-surface-variant/50 text-xs font-medium rounded-lg pl-9 pr-8 py-1.5 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Filter Tabs */}
        {showFilters && (
          <nav className="flex items-center space-x-5 text-xs font-semibold">
            <button
              onClick={() => onFilterChange('all')}
              className={`pb-1 transition-all duration-150 ${
                activeFilter === 'all'
                  ? 'text-primary border-b-2 border-primary-container'
                  : 'text-on-surface-variant hover:text-primary border-b-2 border-transparent'
              }`}
            >
              All Games
            </button>
            <button
              onClick={() => onFilterChange('installed')}
              className={`pb-1 transition-all duration-150 ${
                activeFilter === 'installed'
                  ? 'text-primary border-b-2 border-primary-container'
                  : 'text-on-surface-variant hover:text-primary border-b-2 border-transparent'
              }`}
            >
              Installed
            </button>
            <button
              onClick={() => onFilterChange('favorites')}
              className={`pb-1 transition-all duration-150 ${
                activeFilter === 'favorites'
                  ? 'text-primary border-b-2 border-primary-container'
                  : 'text-on-surface-variant hover:text-primary border-b-2 border-transparent'
              }`}
            >
              Favorites
            </button>
          </nav>
        )}
      </div>

      {/* Trailing actions: Add Game CTA & Frameless Window Controls */}
      <div className="flex items-center space-x-3 shrink-0 titlebar-no-drag">
        {/* Primary Action: Add Game */}
        <button
          onClick={onOpenAddModal}
          className="bg-primary-container hover:bg-primary text-black font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-primary-container/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Game</span>
        </button>

        {/* Window controls */}
        <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-outline-variant/30">
          <button
            onClick={() => launcherApi.minimizeWindow()}
            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => launcherApi.maximizeWindow()}
            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            onClick={() => launcherApi.closeWindow()}
            className="p-1.5 rounded hover:bg-status-error hover:text-white text-on-surface-variant transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
