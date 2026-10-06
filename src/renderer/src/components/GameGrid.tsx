import React from 'react'
import { Game } from '../types/game'
import { GameCard } from './GameCard'

interface GameGridProps {
  games: Game[]
  runningIds: string[]
  onLaunch: (gameId: string) => void
  onTerminate: (gameId: string) => void
  onToggleFavorite: (game: Game) => void
  onRequestRemove: (game: Game) => void
  onChangeArtwork?: (game: Game) => void
  onRefreshArtwork?: (game: Game) => void
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  runningIds,
  onLaunch,
  onTerminate,
  onToggleFavorite,
  onRequestRemove,
  onChangeArtwork,
  onRefreshArtwork
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          isRunning={runningIds.includes(game.id)}
          onLaunch={onLaunch}
          onTerminate={onTerminate}
          onToggleFavorite={onToggleFavorite}
          onRequestRemove={onRequestRemove}
          onChangeArtwork={onChangeArtwork}
          onRefreshArtwork={onRefreshArtwork}
        />
      ))}
    </div>
  )
}
