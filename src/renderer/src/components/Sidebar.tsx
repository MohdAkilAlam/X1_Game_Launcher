import React from 'react'
import { Home, Gamepad2, Settings, PlusCircle, HardDrive } from 'lucide-react'
import { SystemTelemetry } from '../types/game'
import logo from '../assets/logo.png'

interface SidebarProps {
  currentTab: 'home' | 'library' | 'settings'
  onSelectTab: (tab: 'home' | 'library' | 'settings') => void
  onOpenAddModal: () => void
  telemetry: SystemTelemetry | null
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  telemetry
}) => {
  return (
    <aside className="w-60 h-screen fixed left-0 top-0 flex flex-col justify-between shrink-0 select-none bg-surface-container-low border-r border-primary-container/20 z-30">
      <div className="flex flex-col h-full py-4 px-3 justify-between">
        {/* Top Brand & Navigation */}
        <div className="flex flex-col">
          {/* Brand identity header */}
          <div className="flex items-center space-x-3 px-3 py-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high border border-primary-container/50 flex items-center justify-center overflow-hidden text-primary-container shadow-amber-glow p-0.5 shrink-0">
              <img
                src={logo}
                alt="X1 Logo"
                className="w-full h-full object-cover object-left scale-110"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-headline text-2xl font-extrabold tracking-tight text-primary leading-none">
                  X1
                </span>
                <span className="font-mono text-[10px] font-semibold bg-surface-container-high text-primary px-1.5 py-0.5 rounded border border-primary-container/30">
                  V0.1.0
                </span>
              </div>
              <p className="font-mono text-[10px] text-on-surface-variant/70 tracking-widest uppercase mt-0.5">
                GAME ENGINE CORE
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => onSelectTab('home')}
              className={`w-full flex items-center space-x-3 font-medium text-sm pl-3.5 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] ${
                currentTab === 'home'
                  ? 'bg-surface-container-high text-primary border-l-2 border-primary-container font-semibold shadow-[inset_4px_0_12px_rgba(245,158,11,0.15)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              }`}
            >
              <Home className={`w-4 h-4 ${currentTab === 'home' ? 'text-primary' : ''}`} />
              <span>Home</span>
            </button>

            <button
              onClick={() => onSelectTab('library')}
              className={`w-full flex items-center space-x-3 font-medium text-sm pl-3.5 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] ${
                currentTab === 'library'
                  ? 'bg-surface-container-high text-primary border-l-2 border-primary-container font-semibold shadow-[inset_4px_0_12px_rgba(245,158,11,0.15)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              }`}
            >
              <Gamepad2 className={`w-4 h-4 ${currentTab === 'library' ? 'text-primary' : ''}`} />
              <span>Library</span>
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className={`w-full flex items-center space-x-3 font-medium text-sm pl-3.5 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] ${
                currentTab === 'settings'
                  ? 'bg-surface-container-high text-primary border-l-2 border-primary-container font-semibold shadow-[inset_4px_0_12px_rgba(245,158,11,0.15)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              }`}
            >
              <Settings className={`w-4 h-4 ${currentTab === 'settings' ? 'text-primary' : ''}`} />
              <span>Settings</span>
            </button>
          </nav>

          {/* Quick Add Action in Sidebar */}
          <div className="mt-7 px-1">
            <button
              onClick={onOpenAddModal}
              className="w-full flex items-center justify-center space-x-2 border border-primary-container/30 hover:border-primary-container bg-surface-container py-2.5 px-3 rounded-lg text-on-surface text-sm font-medium hover:bg-surface-container-high active:scale-[0.98] transition-all hover:shadow-amber-glow"
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>Add Game</span>
            </button>
          </div>
        </div>

        {/* Bottom System Telemetry */}
        <div className="pt-4 border-t border-primary-container/20 px-1 space-y-3">
          {/* Telemetry card */}
          <div className="bg-surface-container p-2.5 rounded-lg border border-primary-container/20">
            <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1.5">
              <div className="flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-primary" />
                <span>Memory</span>
              </div>
              <span className="text-primary font-semibold">
                {telemetry ? `${telemetry.ramUsagePercent}%` : 'Optimal'}
              </span>
            </div>
            {/* Memory / Usage Bar */}
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-primary-container to-primary rounded-full transition-all duration-500"
                style={{ width: `${telemetry?.ramUsagePercent || 45}%` }}
              />
            </div>
          </div>

          {/* Process status indicator */}
          <div className="flex items-center justify-between px-1 text-xs font-mono text-on-surface-variant/80">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-status-running animate-pulse shadow-[0_0_8px_#22c55e]" />
              <span className="text-on-surface font-medium">Core Ready</span>
            </div>
            <span>v0.1.0</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
