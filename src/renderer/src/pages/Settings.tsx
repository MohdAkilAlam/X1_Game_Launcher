import React, { useState } from 'react'
import {
  Sliders,
  FolderOpen,
  Palette,
  Info,
  Check,
  RefreshCw,
  Terminal,
  ShieldCheck
} from 'lucide-react'
import { LauncherSettings } from '../types/game'
import { launcherApi } from '../services/launcherApi'
import logo from '../assets/logo.png'

interface SettingsProps {
  settings: LauncherSettings
  onUpdateSettings: (newSettings: Partial<LauncherSettings>) => void
  onRescanLibrary: () => void
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onRescanLibrary
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const handleToggle = (key: keyof LauncherSettings) => {
    const updated = !settings[key]
    onUpdateSettings({ [key]: updated })
    triggerSavedFeedback()
  }

  const handleSelectDefaultFolder = async () => {
    const dir = await launcherApi.selectDirectory()
    if (dir) {
      onUpdateSettings({ defaultLibraryPath: dir })
      triggerSavedFeedback()
    }
  }

  const handleRescan = () => {
    setIsScanning(true)
    setTimeout(() => {
      onRescanLibrary()
      setIsScanning(false)
      triggerSavedFeedback()
    }, 600)
  }

  const triggerSavedFeedback = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  return (
    <div className="max-w-4xl space-y-8 pb-16 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Launcher Settings</h1>
          <p className="text-xs font-mono text-on-surface-variant mt-1">
            Configure system behavior, directories, and interface preferences
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary-container/20 border border-primary-container/50 text-primary text-xs font-mono animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* SECTION 1: GENERAL */}
      <section className="bg-surface-container-low rounded-xl border border-outline-variant/60 p-6 space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-outline-variant/30 text-primary">
          <Sliders className="w-4 h-4" />
          <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface">
            General
          </h2>
        </div>

        <div className="space-y-4">
          {/* Launcher startup */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-on-surface">Run on System Startup</div>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Automatically start X1 Launcher when you boot your PC
              </p>
            </div>
            <button
              onClick={() => handleToggle('autoLaunch')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.autoLaunch ? 'bg-primary-container' : 'bg-surface-container-highest'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoLaunch ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Minimize to tray */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-on-surface">Minimize to System Tray</div>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Keep X1 running in the Windows tray when minimized
              </p>
            </div>
            <button
              onClick={() => handleToggle('minimizeToTray')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.minimizeToTray ? 'bg-primary-container' : 'bg-surface-container-highest'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.minimizeToTray ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Start Minimized */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-on-surface">Start Minimized</div>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Launch secretly in the background without focusing the window
              </p>
            </div>
            <button
              onClick={() => handleToggle('startMinimized')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.startMinimized ? 'bg-primary-container' : 'bg-surface-container-highest'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.startMinimized ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: LIBRARY */}
      <section className="bg-surface-container-low rounded-xl border border-outline-variant/60 p-6 space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-outline-variant/30 text-primary">
          <FolderOpen className="w-4 h-4" />
          <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface">
            Library
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Default Game Directory
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={settings.defaultLibraryPath || 'C:\\Games'}
                className="flex-1 bg-surface-container border border-outline-variant text-on-surface text-xs rounded-lg px-3 py-2 font-mono truncate"
              />
              <button
                onClick={handleSelectDefaultFolder}
                className="px-3.5 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold rounded-lg border border-outline-variant flex items-center space-x-1.5 shrink-0 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5 text-primary" />
                <span>Change Path</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="font-semibold text-xs text-on-surface">Rescan Installed Games</div>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Check executable existence and refresh status for all library games
              </p>
            </div>
            <button
              onClick={handleRescan}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-lg border border-primary-container/30 bg-surface-container hover:bg-surface-container-high text-xs font-semibold flex items-center space-x-1.5 text-primary active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Rescan Library'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: APPEARANCE */}
      <section className="bg-surface-container-low rounded-xl border border-outline-variant/60 p-6 space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-outline-variant/30 text-primary">
          <Palette className="w-4 h-4" />
          <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface">
            Appearance
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-on-surface">Theme Profile</div>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Stitch Solar Amber & Obsidian High-Performance Tactical Dark
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-primary px-2.5 py-1 rounded bg-surface-container border border-primary-container/30">
              Solar Amber (Default)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-on-surface">UI Micro-Animations</div>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Smooth transitions, button active states, and card scale on hover
              </p>
            </div>
            <button
              onClick={() => handleToggle('animationsEnabled')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.animationsEnabled ? 'bg-primary-container' : 'bg-surface-container-highest'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.animationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: ABOUT */}
      <section className="bg-surface-container-low rounded-xl border border-outline-variant/60 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center space-x-2.5 text-primary">
            <Info className="w-4 h-4" />
            <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface">
              About X1 Launcher
            </h2>
          </div>
          <img
            src={logo}
            alt="X1 Game Launcher"
            className="h-7 w-auto object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1">
            <span className="text-on-surface-variant text-[11px]">APPLICATION VERSION</span>
            <div className="font-bold text-primary flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>v0.1.0-alpha (Build 2026.1)</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1">
            <span className="text-on-surface-variant text-[11px]">SECURITY SPEC</span>
            <div className="font-bold text-status-running flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Isolated IPC / Sandboxed Renderer</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant pt-2 leading-relaxed">
          X1 Launcher is a modern, high-performance desktop command center for games. Engineered
          with Electron, React, TypeScript, and Vite. Designed according to the Obsidian Kinetic /
          Solar Amber specification.
        </p>
      </section>
    </div>
  )
}
