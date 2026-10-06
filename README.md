# X1 Launcher - V0.1

A modern, high-performance desktop Game Launcher built with Electron, React, TypeScript, Vite, and Tailwind CSS. Styled using the **Solar Amber & Obsidian Tactical** design system from Stitch (Project ID: `11647036052036250712`).

---

## ⚡ Tech Stack & Architecture

- **Runtime & Desktop Core:** Electron 39 (with secure `contextIsolation: true`, sandboxed renderer)
- **UI Framework:** React 19 + TypeScript + Vite 7
- **Styling:** Tailwind CSS + PostCSS + Google Fonts (Plus Jakarta Sans, Inter, JetBrains Mono)
- **Icons:** Lucide React
- **Storage Layer:** Structured local JSON persistence (`x1-launcher-data.json` in user data) with an abstracted service layer ready for SQLite migration
- **IPC Architecture:** Secure, typed preload bridge connecting renderer to modular main-process services

```
my-game-launcher/
├── src/
│   ├── main/
│   │   ├── index.ts               # Frameless Electron window, protocol & app lifecycle
│   │   ├── ipc/
│   │   │   ├── gameHandlers.ts    # IPC handlers for game CRUD, launch & dialogs
│   │   │   └── settingsHandlers.ts# IPC handlers for settings, window controls & telemetry
│   │   └── services/
│   │       ├── storageService.ts  # JSON database persistence service
│   │       ├── gameService.ts     # Library management & cover caching
│   │       └── processService.ts  # Safe process spawning & playtime tracking
│   │
│   ├── preload/
│   │   ├── index.ts               # Secure contextBridge API
│   │   └── index.d.ts             # Strong TypeScript definitions for window.api
│   │
│   └── renderer/src/
│       ├── components/
│       │   ├── Sidebar.tsx        # Vertical rail with navigation & system telemetry
│       │   ├── TopBar.tsx         # Drag region, search input, filter tabs & window buttons
│       │   ├── HeroBanner.tsx     # Featured game hero with live telemetry & Play button
│       │   ├── GameCard.tsx       # 3:4 aspect ratio cards with hover details & play states
│       │   ├── GameGrid.tsx       # Responsive layout for 1280x720 up to 4K resolutions
│       │   ├── AddGameModal.tsx   # Native file browser for .exe & cover selection
│       │   ├── ConfirmDialog.tsx  # Non-destructive game removal dialog
│       │   └── EmptyState.tsx     # Beautiful empty library & search fallback states
│       ├── pages/
│       │   ├── Home.tsx           # Dashboard with Featured, Recently Played & Quick Library
│       │   ├── Library.tsx        # Full library with sorting, searching & filtering
│       │   └── Settings.tsx       # General, Library path, Appearance & About settings
│       ├── services/
│       │   └── launcherApi.ts     # Decoupled renderer service wrapper
│       ├── types/
│       │   └── game.ts            # Data models & interfaces
│       ├── App.tsx                # Master state controller & IPC listeners
│       └── main.tsx
```

---

## 🚀 Running the Application

### 1. Development Mode
Start the live hot-reloading development server:
```bash
npm run dev
```

### 2. Type Check
Run both Node and Web TypeScript checks:
```bash
npm run typecheck
```

### 3. Production Build
Build the production package:
```bash
npm run build
```

---

## ✨ Features Implemented in V0.1

1. **Dashboard / Home:**
   - Featured game hero showcase with playtime telemetry
   - Recently played games row
   - Complete library overview
   - System memory telemetry monitor & Core Ready status indicator

2. **Game Library:**
   - Native Electron file picker for local `.exe`, `.bat`, or `.cmd` executables
   - Auto-names game based on executable filename with custom naming option
   - Optional cover image selection (copied locally to application storage)
   - Optional launch arguments & platform selection
   - Persistent local JSON storage

3. **Game Cards:**
   - 3:4 aspect ratio cards with smooth hover scale
   - Playtime and last-played relative timestamp displays
   - One-click launch and stop controls
   - Favorites toggle

4. **Process Launching & Tracking:**
   - Safe Node process spawning (`child_process.spawn`) without shell injection
   - Path validation before execution
   - Real-time "Running" status in card & hero banner
   - Automatic exit detection, elapsed playtime tally, and last-played timestamp update
   - Graceful error toasts without crashing the launcher

5. **Non-Destructive Removal:**
   - Modal confirmation ensuring files on disk are preserved

6. **Search & Filter:**
   - Global search by game name (with `Ctrl+F` shortcut)
   - Filter tabs: All Games, Installed, Favorites
   - Multi-option sorting (Recently Played, Alphabetical, Most Played, Recently Added)

7. **Settings:**
   - General (Startup, Tray, Minimized options)
   - Library (Default path selection dialog, rescan library)
   - Appearance (Solar Amber theme, micro-animations toggle)
   - About specifications
