import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Square,
  Star,
  Trash2,
  Clock,
  Gamepad2,
  MoreVertical,
  Image as ImageIcon,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { Game } from '../types/game'
import { formatPlayTime, formatLastPlayed, getCoverDisplayUrl } from '../utils/format'

interface GameCardProps {
  game: Game
  isRunning: boolean
  onLaunch: (gameId: string) => void
  onTerminate: (gameId: string) => void
  onToggleFavorite: (game: Game) => void
  onRequestRemove: (game: Game) => void
  onChangeArtwork?: (game: Game) => void
  onRefreshArtwork?: (game: Game) => void
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isRunning,
  onLaunch,
  onTerminate,
  onToggleFavorite,
  onRequestRemove,
  onChangeArtwork,
  onRefreshArtwork
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [showMenu])

  const coverUrl = getCoverDisplayUrl(game.coverPath)

  return (
    <div className="group relative flex flex-col bg-surface-container-low rounded-xl border border-outline-variant/60 hover:border-primary-container/80 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-amber-glow/20">
      {/* 3:4 Aspect Ratio Cover Container */}
      <div className="relative aspect-[3/4] w-full bg-surface-container overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Hide broken image link
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-surface-variant to-surface-container-high text-on-surface-variant">
            <Gamepad2 className="w-12 h-12 text-primary/40 mb-2 group-hover:scale-110 group-hover:text-primary transition-all duration-200" />
            <span className="font-headline font-bold text-center text-xs text-on-surface line-clamp-2 px-1">
              {game.name}
            </span>
            {onChangeArtwork && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChangeArtwork(game)
                }}
                className="mt-2.5 flex items-center space-x-1 px-2.5 py-1 rounded-md bg-primary-container/20 hover:bg-primary-container text-primary hover:text-black font-mono text-[10px] font-bold transition-all"
              >
                <Sparkles className="w-3 h-3" />
                <span>Find Artwork</span>
              </button>
            )}
          </div>
        )}

        {/* Top Badges / Floating Actions */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          {/* Running or Platform Badge */}
          {isRunning ? (
            <span className="flex items-center space-x-1.5 bg-black/80 backdrop-blur-md border border-status-running/60 text-status-running text-[10px] font-mono px-2 py-0.5 rounded-full shadow-md animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-status-running" />
              <span>RUNNING</span>
            </span>
          ) : (
            <span className="bg-black/70 backdrop-blur-md text-[10px] font-mono text-on-surface-variant px-2 py-0.5 rounded border border-white/10">
              {game.platform || 'PC'}
            </span>
          )}

          {/* Quick Actions (Favorite & Context Menu) */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(game)
              }}
              className={`p-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 hover:border-primary-container text-on-surface-variant hover:text-primary transition-colors ${
                game.favorite ? 'text-primary' : ''
              }`}
              title={game.favorite ? 'Favorited' : 'Favorite'}
            >
              <Star className={`w-3.5 h-3.5 ${game.favorite ? 'fill-primary' : ''}`} />
            </button>

            {/* Context Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 hover:border-primary-container text-on-surface-variant hover:text-primary transition-colors"
                title="More Options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {/* Context Dropdown */}
              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-44 bg-surface-container border border-outline-variant/80 rounded-xl shadow-2xl p-1 z-50 text-xs font-headline font-semibold text-on-surface animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onChangeArtwork && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onChangeArtwork(game)
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      <span>Change Artwork</span>
                    </button>
                  )}

                  {onRefreshArtwork && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onRefreshArtwork(game)
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-primary" />
                      <span>Refresh Artwork</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-outline-variant/40" />

                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onRequestRemove(game)
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-status-error/15 text-status-error transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Game</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrim Overlay on Hover with Instant Play Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
          <div className="text-[11px] font-mono text-on-surface-variant space-y-0.5 mb-3">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-primary" />
              <span>{formatPlayTime(game.playTime)} played</span>
            </div>
            <div>Last: {formatLastPlayed(game.lastPlayed)}</div>
          </div>

          {isRunning ? (
            <button
              onClick={() => onTerminate(game.id)}
              className="w-full bg-status-running hover:bg-red-600 text-black hover:text-white font-headline text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-md"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP</span>
            </button>
          ) : (
            <button
              onClick={() => onLaunch(game.id)}
              className="w-full bg-primary-container hover:bg-primary text-black font-headline text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-amber-glow"
            >
              <Play className="w-3.5 h-3.5 fill-black stroke-none" />
              <span>PLAY</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Footer Info */}
      <div className="p-3 bg-surface-container-low border-t border-outline-variant/40 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <h3 className="font-headline font-semibold text-xs text-on-surface truncate">
            {game.name}
          </h3>
          <p className="text-[10px] font-mono text-on-surface-variant truncate mt-0.5">
            {formatPlayTime(game.playTime)} • {formatLastPlayed(game.lastPlayed)}
          </p>
        </div>

        {/* Static Play button for quick touch / no hover devices */}
        <button
          onClick={() => (isRunning ? onTerminate(game.id) : onLaunch(game.id))}
          className={`shrink-0 p-1.5 rounded-lg border transition-all active:scale-95 ${
            isRunning
              ? 'bg-status-running/20 border-status-running text-status-running hover:bg-red-500/20 hover:border-red-500 hover:text-red-400'
              : 'bg-surface-container border-outline-variant hover:border-primary-container text-primary hover:bg-primary-container hover:text-black'
          }`}
          title={isRunning ? 'Stop' : 'Play'}
        >
          {isRunning ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </button>
      </div>
    </div>
  )
}
