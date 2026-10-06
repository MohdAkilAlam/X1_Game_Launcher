import React from 'react'
import { Plus, Gamepad2, Sparkles } from 'lucide-react'

interface EmptyStateProps {
  onOpenAddModal: () => void
  isSearchEmpty?: boolean
  searchQuery?: string
  onClearSearch?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenAddModal,
  isSearchEmpty = false,
  searchQuery = '',
  onClearSearch
}) => {
  if (isSearchEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-outline-variant/60 rounded-2xl bg-surface-container-low/40">
        <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4 text-on-surface-variant">
          <Gamepad2 className="w-7 h-7 text-primary/60" />
        </div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-1">No games found</h3>
        <p className="text-xs font-mono text-on-surface-variant max-w-sm mb-5">
          No titles matched &ldquo;{searchQuery}&rdquo;. Try another keyword or add a new game.
        </p>
        <div className="flex items-center space-x-3">
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant transition-colors"
            >
              Clear Search
            </button>
          )}
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary-container hover:bg-primary text-black flex items-center space-x-1.5 transition-all shadow-amber-glow"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Game</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-primary-container/20 rounded-2xl bg-surface-container-low/30 backdrop-blur-sm relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute w-72 h-72 bg-primary-container/5 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-72 h-72 bg-primary-container/5 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-primary-container/30 flex items-center justify-center mb-5 text-primary shadow-amber-glow">
          <Gamepad2 className="w-8 h-8 text-primary" />
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-container border border-primary-container/20 text-[11px] font-mono text-primary mb-3">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>X1 ENGINE INITIALIZED</span>
        </div>
        <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-2">
          Your library is empty
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mb-8 leading-relaxed">
          Add your first local game executable (.exe) to start building your command center library.
          Track playtime, launch instantly, and customize covers.
        </p>
        <button
          onClick={onOpenAddModal}
          className="bg-primary-container hover:bg-primary text-black font-headline text-sm font-bold px-6 py-3 rounded-xl flex items-center space-x-2 transition-all active:scale-95 shadow-amber-glow"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Your First Game</span>
        </button>
      </div>
    </div>
  )
}
