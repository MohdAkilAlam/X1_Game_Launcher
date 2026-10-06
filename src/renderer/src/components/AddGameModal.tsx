import React, { useState } from 'react'
import {
  X,
  FolderOpen,
  Gamepad2,
  AlertCircle,
  Loader2,
  Check,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Terminal,
  Image as ImageIcon
} from 'lucide-react'
import { launcherApi } from '../services/launcherApi'
import { AddGameInput, GameMetadataResult, GameDetectionResult } from '../types/game'

interface AddGameModalProps {
  isOpen: boolean
  onClose: () => void
  onGameAdded: (game: any) => void
}

type Step = 'SELECT_EXE' | 'DETECTING' | 'CONFIRM' | 'SEARCH_RESULTS' | 'NOT_FOUND' | 'SAVING'

export const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose, onGameAdded }) => {
  const [step, setStep] = useState<Step>('SELECT_EXE')
  const [executablePath, setExecutablePath] = useState('')
  const [detectedQuery, setDetectedQuery] = useState('')
  const [manualQuery, setManualQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GameMetadataResult[]>([])
  const [selectedGame, setSelectedGame] = useState<GameMetadataResult | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('Finding game...')
  const [error, setError] = useState<string | null>(null)

  // Advanced options (preserved from V0.1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customName, setCustomName] = useState('')
  const [launchArguments, setLaunchArguments] = useState('')
  const [platform, setPlatform] = useState('PC / Windows')

  if (!isOpen) return null

  const resetState = () => {
    setStep('SELECT_EXE')
    setExecutablePath('')
    setDetectedQuery('')
    setManualQuery('')
    setSearchResults([])
    setSelectedGame(null)
    setLoadingMessage('Finding game...')
    setError(null)
    setShowAdvanced(false)
    setCustomName('')
    setLaunchArguments('')
    setPlatform('PC / Windows')
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  // Step 1: Browse executable and automatically detect game
  const handleSelectExecutable = async () => {
    try {
      setError(null)
      const selected = await launcherApi.selectExecutable()
      if (!selected) return

      setExecutablePath(selected)
      await runDetection(selected)
    } catch (err: any) {
      setError(err?.message || 'Failed to select executable')
    }
  }

  // Core detection runner
  const runDetection = async (path: string) => {
    setStep('DETECTING')
    setLoadingMessage('Finding game...')
    setError(null)

    try {
      const detection: GameDetectionResult = await launcherApi.detectGame(path)
      const queryName = detection.detectedName || detection.query || ''
      setDetectedQuery(queryName)
      setManualQuery(queryName)
      setCustomName(queryName)

      if (detection.results && detection.results.length > 0) {
        setSearchResults(detection.results)
        setSelectedGame(detection.results[0])
        setStep('CONFIRM')
      } else {
        setSearchResults([])
        setSelectedGame(null)
        setStep('NOT_FOUND')
      }
    } catch (err: any) {
      console.error('Detection error:', err)
      setStep('NOT_FOUND')
    }
  }

  // Manual search fallback
  const handleManualSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!manualQuery.trim()) return

    setStep('DETECTING')
    setLoadingMessage('Finding game...')
    setError(null)

    try {
      const results = await launcherApi.searchGameMetadata(manualQuery.trim())
      setSearchResults(results)
      if (results.length > 0) {
        setSelectedGame(results[0])
        setStep('CONFIRM')
      } else {
        setSelectedGame(null)
        setStep('NOT_FOUND')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to search metadata.')
      setStep('NOT_FOUND')
    }
  }

  // Save game with selected artwork
  const handleConfirmSave = async () => {
    if (!executablePath) {
      setError('Missing game executable.')
      return
    }

    setStep('SAVING')
    setLoadingMessage(selectedGame?.coverUrl ? 'Downloading artwork...' : 'Adding game...')
    setError(null)

    try {
      const gameTitle = customName.trim() || selectedGame?.name || detectedQuery || 'Untitled Game'

      const payload: AddGameInput = {
        name: gameTitle,
        executablePath,
        coverUrl: selectedGame?.coverUrl,
        metadataId: selectedGame?.id,
        developer: selectedGame?.developer,
        publisher: selectedGame?.publisher,
        releaseDate: selectedGame?.releaseDate,
        description: selectedGame?.description,
        launchArguments: launchArguments.trim() || undefined,
        platform
      }

      setLoadingMessage('Adding game...')
      const createdGame = await launcherApi.addGame(payload)
      onGameAdded(createdGame)
      handleClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to add game.')
      setStep('CONFIRM')
    }
  }

  // Save game without artwork (offline / not found fallback)
  const handleAddWithoutArtwork = async () => {
    if (!executablePath) {
      setError('Please select a valid game executable first.')
      return
    }

    setStep('SAVING')
    setLoadingMessage('Adding game...')
    setError(null)

    try {
      const gameTitle = customName.trim() || detectedQuery || 'Local Game'

      const payload: AddGameInput = {
        name: gameTitle,
        executablePath,
        launchArguments: launchArguments.trim() || undefined,
        platform
      }

      const createdGame = await launcherApi.addGame(payload)
      onGameAdded(createdGame)
      handleClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to add game without artwork.')
      setStep('SELECT_EXE')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-surface-container border border-primary-container/30 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">Add Game</h2>
              <p className="text-xs font-mono text-on-surface-variant">
                Automatic cover art & metadata detection
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-status-error/15 border border-status-error/30 text-status-error text-xs flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Modal Body */}
        <div className="p-6">
          {/* STATE 1: SELECT EXECUTABLE */}
          {step === 'SELECT_EXE' && (
            <div className="space-y-5">
              <div
                onClick={handleSelectExecutable}
                className="cursor-pointer border-2 border-dashed border-outline-variant hover:border-primary-container/80 hover:bg-surface-container-high/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 group-hover:bg-primary-container/30 text-primary flex items-center justify-center mb-3 transition-colors">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="font-headline font-semibold text-sm text-on-surface mb-1">
                  Choose Game Executable
                </h3>
                <p className="text-xs font-mono text-on-surface-variant max-w-xs">
                  Select your game's <span className="text-primary">.exe</span> file. X1 Launcher
                  will automatically identify the title and retrieve cover artwork.
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-primary-container hover:bg-primary text-black text-xs font-bold rounded-lg transition-all shadow-amber-glow"
                >
                  Browse Files
                </button>
              </div>

              {executablePath && (
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant font-mono text-xs text-on-surface truncate">
                  Selected: {executablePath}
                </div>
              )}
            </div>
          )}

          {/* STATE 2: LOADING (FINDING GAME / DOWNLOADING ARTWORK) */}
          {(step === 'DETECTING' || step === 'SAVING') && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/10 border border-primary-container/40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">
                  {loadingMessage}
                </h3>
                <p className="text-xs font-mono text-on-surface-variant mt-1 max-w-xs mx-auto">
                  {step === 'DETECTING'
                    ? 'Analyzing executable signals and querying game metadata database...'
                    : 'Saving locally to your library...'}
                </p>
              </div>
            </div>
          )}

          {/* STATE 3: CONFIRMATION DIALOG */}
          {step === 'CONFIRM' && selectedGame && (
            <div className="space-y-5">
              <div className="text-center pb-1">
                <span className="text-xs font-mono text-primary uppercase tracking-wider font-semibold">
                  Match Detected
                </span>
                <h3 className="font-headline text-lg font-bold text-on-surface mt-0.5">
                  Is this the correct game?
                </h3>
              </div>

              {/* Detected Game Card */}
              <div className="flex space-x-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/70 shadow-lg">
                {/* 3:4 Cover Art Preview */}
                <div className="w-28 aspect-[3/4] rounded-lg overflow-hidden bg-surface-container border border-outline-variant/60 shrink-0 relative shadow-md">
                  {selectedGame.coverUrl ? (
                    <img
                      src={selectedGame.coverUrl}
                      alt={selectedGame.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant p-2">
                      <ImageIcon className="w-8 h-8 text-primary/40 mb-1" />
                      <span className="text-[10px] font-mono text-center">No Cover</span>
                    </div>
                  )}
                </div>

                {/* Game Info Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="font-headline text-base font-bold text-on-surface leading-tight line-clamp-2">
                      {selectedGame.name}
                    </h4>
                    <div className="mt-1.5 space-y-0.5 text-xs font-mono text-on-surface-variant">
                      {selectedGame.developer && (
                        <p className="truncate">
                          <span className="text-on-surface/70">Developer:</span>{' '}
                          {selectedGame.developer}
                        </p>
                      )}
                      {selectedGame.releaseDate && (
                        <p className="truncate">
                          <span className="text-on-surface/70">Released:</span>{' '}
                          {selectedGame.releaseDate}
                        </p>
                      )}
                    </div>
                    {selectedGame.description && (
                      <p className="text-[11px] text-on-surface-variant/80 mt-2 line-clamp-2 leading-relaxed">
                        {selectedGame.description}
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-on-surface-variant/70 truncate pt-2">
                    {executablePath}
                  </div>
                </div>
              </div>

              {/* Advanced Settings Accordion */}
              <div className="border border-outline-variant/40 rounded-xl overflow-hidden bg-surface-container-low/40">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-2.5 px-3 flex items-center justify-between text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span>Advanced Options (Launch Flags, Custom Title)</span>
                  {showAdvanced ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="p-3 pt-0 space-y-3 border-t border-outline-variant/40">
                    <div>
                      <label className="block text-[11px] font-mono text-on-surface-variant mb-1">
                        Display Title Override
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder={selectedGame.name}
                        className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-on-surface-variant mb-1">
                        Launch Arguments
                      </label>
                      <div className="relative">
                        <Terminal className="w-3 h-3 text-primary/70 absolute left-2.5 top-2 pointer-events-none" />
                        <input
                          type="text"
                          value={launchArguments}
                          onChange={(e) => setLaunchArguments(e.target.value)}
                          placeholder="-fullscreen -novid"
                          className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs rounded-lg pl-8 pr-2.5 py-1.5 font-mono focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-on-surface-variant mb-1">
                        Platform Tag
                      </label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-primary"
                      >
                        <option value="PC / Windows">PC / Windows</option>
                        <option value="Steam Native">Steam Native</option>
                        <option value="Epic Native">Epic Native</option>
                        <option value="GOG Native">GOG Native</option>
                        <option value="Indie / Custom">Indie / Custom</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('SEARCH_RESULTS')}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors"
                >
                  Choose Different Result ({searchResults.length})
                </button>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleAddWithoutArtwork}
                    className="px-3 py-2 text-xs font-semibold rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Skip Artwork
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSave}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-primary-container hover:bg-primary text-black transition-all shadow-amber-glow"
                  >
                    Confirm & Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: MULTIPLE RESULTS LIST / SEARCH */}
          {step === 'SEARCH_RESULTS' && (
            <div className="space-y-4">
              {/* Search Header */}
              <form onSubmit={handleManualSearch} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder="Search game title..."
                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface text-xs rounded-lg pl-9 pr-3 py-2 font-mono focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold rounded-lg border border-outline-variant transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Results List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {searchResults.map((item) => {
                  const isSelected = selectedGame?.id === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedGame(item)
                        setStep('CONFIRM')
                      }}
                      className={`cursor-pointer p-2.5 rounded-xl border flex items-center space-x-3 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary-container/10 ring-1 ring-primary'
                          : 'border-outline-variant/60 bg-surface-container-low hover:border-outline-variant'
                      }`}
                    >
                      <div className="w-12 aspect-[3/4] rounded-lg overflow-hidden bg-surface-container shrink-0">
                        {item.coverUrl ? (
                          <img
                            src={item.coverUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            <ImageIcon className="w-4 h-4 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-headline font-semibold text-xs text-on-surface truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] font-mono text-on-surface-variant truncate mt-0.5">
                          {item.releaseDate || 'Unknown'} {item.developer && `• ${item.developer}`}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => setStep(selectedGame ? 'CONFIRM' : 'SELECT_EXE')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleAddWithoutArtwork}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-on-surface-variant hover:text-on-surface"
                >
                  Add Without Artwork
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: NO RESULTS FOUND */}
          {step === 'NOT_FOUND' && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center mx-auto mb-2">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-base font-bold text-on-surface">
                  Game not found automatically
                </h3>
                <p className="text-xs font-mono text-on-surface-variant max-w-sm mx-auto mt-1">
                  We couldn't automatically detect metadata for this executable. You can search
                  manually or add it with default artwork.
                </p>
              </div>

              {/* Manual Search Input */}
              <form onSubmit={handleManualSearch} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Search Manually
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value)}
                      placeholder="e.g. Elden Ring, Hades, Cyberpunk 2077..."
                      className="flex-1 bg-surface-container-low border border-outline-variant focus:border-primary-container text-on-surface text-xs rounded-lg px-3 py-2 font-mono focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-container hover:bg-primary text-black text-xs font-bold rounded-lg shrink-0 transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {/* Or Add Without Artwork */}
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('SELECT_EXE')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface"
                >
                  Choose Different File
                </button>
                <button
                  type="button"
                  onClick={handleAddWithoutArtwork}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface border border-outline-variant transition-colors"
                >
                  Add Without Artwork
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
