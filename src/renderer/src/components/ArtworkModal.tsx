import React, { useState, useEffect } from 'react'
import {
  X,
  Search,
  FolderOpen,
  Image as ImageIcon,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { Game, GameMetadataResult } from '../types/game'
import { launcherApi } from '../services/launcherApi'
import { getCoverDisplayUrl } from '../utils/format'

interface ArtworkModalProps {
  isOpen: boolean
  game: Game | null
  initialMode?: 'search' | 'local'
  onClose: () => void
  onArtworkUpdated: (updatedGame: Game) => void
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  isOpen,
  game,
  initialMode = 'search',
  onClose,
  onArtworkUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'local'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<GameMetadataResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedResult, setSelectedResult] = useState<GameMetadataResult | null>(null)
  const [localImagePath, setLocalImagePath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && game) {
      setActiveTab(initialMode)
      setSearchQuery(game.name)
      setSelectedResult(null)
      setLocalImagePath(null)
      setError(null)
      // Auto-trigger search when opened
      handleSearch(game.name)
    }
  }, [isOpen, game, initialMode])

  if (!isOpen || !game) return null

  const handleSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim()
    if (!q) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await launcherApi.searchGameMetadata(q)
      setResults(data)
      if (data.length > 0) {
        setSelectedResult(data[0])
      } else {
        setSelectedResult(null)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to search artwork metadata.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectLocalImage = async () => {
    try {
      setError(null)
      const path = await launcherApi.selectCoverImage()
      if (path) {
        setLocalImagePath(path)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to select image.')
    }
  }

  const handleApplySelectedArtwork = async () => {
    if (!selectedResult?.coverUrl) {
      setError('Please select an artwork result with a valid cover image.')
      return
    }

    try {
      setIsUpdating(true)
      setError(null)

      const updated = await launcherApi.changeGameArtwork({
        gameId: game.id,
        coverUrl: selectedResult.coverUrl,
        metadata: {
          metadataId: selectedResult.id,
          developer: selectedResult.developer || game.developer,
          publisher: selectedResult.publisher || game.publisher,
          releaseDate: selectedResult.releaseDate || game.releaseDate,
          description: selectedResult.description || game.description
        }
      })

      if (updated) {
        onArtworkUpdated(updated)
        onClose()
      } else {
        setError('Failed to update artwork in library database.')
      }
    } catch (err: any) {
      setError(err?.message || 'Error updating game artwork.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleApplyLocalImage = async () => {
    if (!localImagePath) {
      setError('Please choose a local image file.')
      return
    }

    try {
      setIsUpdating(true)
      setError(null)

      const updated = await launcherApi.changeGameArtwork({
        gameId: game.id,
        localImagePath
      })

      if (updated) {
        onArtworkUpdated(updated)
        onClose()
      } else {
        setError('Failed to apply local image.')
      }
    } catch (err: any) {
      setError(err?.message || 'Error updating local artwork.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-surface-container border border-primary-container/30 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-on-surface">Change Artwork</h2>
              <p className="text-xs font-mono text-on-surface-variant truncate max-w-md">
                {game.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-outline-variant/40 px-5 pt-3 space-x-6 shrink-0 bg-surface-container-low/50">
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-3 text-xs font-headline font-semibold transition-all relative ${
              activeTab === 'search'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Search Online Artwork</span>
            </div>
            {activeTab === 'search' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`pb-3 text-xs font-headline font-semibold transition-all relative ${
              activeTab === 'local' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Choose Local Image</span>
            </div>
            {activeTab === 'local' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-status-error/15 border border-status-error/30 text-status-error text-xs flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'search' && (
            <>
              {/* Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearch(searchQuery)
                }}
                className="flex items-center space-x-2"
              >
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search game title..."
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary-container text-on-surface text-xs rounded-lg pl-9 pr-3 py-2 font-mono focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold rounded-lg border border-outline-variant flex items-center space-x-1.5 shrink-0 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span>Search</span>
                </button>
              </form>

              {/* Loading State */}
              {isLoading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 text-on-surface-variant">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-xs font-mono">Searching game metadata database...</p>
                </div>
              )}

              {/* Results Grid */}
              {!isLoading && results.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-mono text-on-surface-variant">
                    Found {results.length} results. Select one to apply:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {results.map((item) => {
                      const isSelected = selectedResult?.id === item.id
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedResult(item)}
                          className={`cursor-pointer rounded-xl border p-2 flex flex-col transition-all relative overflow-hidden bg-surface-container-low ${
                            isSelected
                              ? 'border-primary shadow-amber-glow/20 ring-1 ring-primary'
                              : 'border-outline-variant/60 hover:border-outline-variant'
                          }`}
                        >
                          <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-surface-container mb-2 relative">
                            {item.coverUrl ? (
                              <img
                                src={item.coverUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                                <ImageIcon className="w-6 h-6 text-primary/40" />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <h4 className="font-headline font-semibold text-xs text-on-surface truncate">
                            {item.name}
                          </h4>
                          <p className="text-[10px] font-mono text-on-surface-variant truncate">
                            {item.releaseDate ? item.releaseDate : 'Unknown date'}
                            {item.developer ? ` • ${item.developer}` : ''}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {!isLoading && results.length === 0 && (
                <div className="py-10 text-center text-on-surface-variant text-xs font-mono">
                  No online artwork found. Try modifying the search title or upload a local image.
                </div>
              )}
            </>
          )}

          {activeTab === 'local' && (
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/60 hover:border-primary/50 rounded-2xl p-8 transition-colors bg-surface-container-low/40">
                {localImagePath ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-32 aspect-[3/4] rounded-xl overflow-hidden border border-outline-variant shadow-lg bg-surface-container">
                      <img
                        src={getCoverDisplayUrl(localImagePath)}
                        alt="Local Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-mono text-on-surface truncate max-w-xs">
                      {localImagePath}
                    </p>
                    <button
                      type="button"
                      onClick={handleSelectLocalImage}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Choose Different Image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-headline font-semibold text-on-surface">
                        Select a Cover Image
                      </p>
                      <p className="text-xs font-mono text-on-surface-variant mt-0.5">
                        Supports PNG, JPG, JPEG, WEBP
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectLocalImage}
                      className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold rounded-lg border border-outline-variant flex items-center space-x-1.5 transition-colors"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-primary" />
                      <span>Browse Files</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-outline-variant/40 flex items-center justify-between shrink-0 bg-surface-container-low/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'search' ? (
            <button
              type="button"
              disabled={isUpdating || !selectedResult}
              onClick={handleApplySelectedArtwork}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-primary-container hover:bg-primary text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-all shadow-amber-glow"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading & Updating...</span>
                </>
              ) : (
                <span>Apply Artwork</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={isUpdating || !localImagePath}
              onClick={handleApplyLocalImage}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-primary-container hover:bg-primary text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-all shadow-amber-glow"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Local Cover</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
