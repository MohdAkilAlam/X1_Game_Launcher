import React from 'react'
import { Play, Square, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { Game } from '../types/game'
import { formatPlayTime, formatLastPlayed, getCoverDisplayUrl } from '../utils/format'

interface HeroBannerProps {
  game: Game
  isRunning: boolean
  onLaunch: (gameId: string) => void
  onTerminate: (gameId: string) => void
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  game,
  isRunning,
  onLaunch,
  onTerminate
}) => {
  const coverUrl = getCoverDisplayUrl(game.coverPath, game.coverUrl)

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-primary-container/30 bg-surface-container-low group shadow-2xl">
      {/* Background with gradient overlay */}
      {coverUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-surface-variant via-surface-container to-background" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-surface-dim via-surface-dim/90 to-transparent" />

      {/* Hero Content Details */}
      <div className="relative z-10 p-8 sm:p-10 max-w-2xl flex flex-col justify-between min-h-[320px]">
        <div>
          {/* Tags & Status Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center space-x-1.5 bg-primary-container/15 border border-primary-container/50 text-primary font-mono text-xs px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              <CheckCircle2 className="w-3 h-3 text-primary" />
              <span>INSTALLED</span>
            </span>
            <span className="text-on-surface-variant text-xs bg-surface-container-high/80 px-2.5 py-0.5 rounded border border-white/5 font-mono">
              {game.platform || 'PC / Windows'}
            </span>
            {isRunning && (
              <span className="flex items-center space-x-1.5 bg-status-running/20 border border-status-running text-status-running font-mono text-xs px-2.5 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-status-running" />
                <span>ACTIVE PROCESS</span>
              </span>
            )}
          </div>

          {/* Game Title */}
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mb-2 drop-shadow-md">
            {game.name}
          </h1>

          {/* Telemetry and Metrics Row */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-on-surface-variant mt-3">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{formatPlayTime(game.playTime)} logged</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Played {formatLastPlayed(game.lastPlayed)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 pt-6">
          {isRunning ? (
            <button
              onClick={() => onTerminate(game.id)}
              className="bg-status-running hover:bg-red-600 text-black hover:text-white font-headline text-sm font-bold px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-150 active:scale-95 shadow-lg group/btn"
            >
              <Square className="w-4 h-4 fill-current group-hover/btn:rotate-90 transition-transform" />
              <span className="group-hover/btn:hidden">RUNNING</span>
              <span className="hidden group-hover/btn:inline">STOP GAME</span>
            </button>
          ) : (
            <button
              onClick={() => onLaunch(game.id)}
              className="bg-primary-container hover:bg-primary text-black font-headline text-sm font-bold px-7 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-150 active:scale-95 shadow-amber-glow"
            >
              <Play className="w-4 h-4 fill-black stroke-none" />
              <span>PLAY NOW</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
