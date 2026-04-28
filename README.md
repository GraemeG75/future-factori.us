# Future Factorius

A retro-futuristic 3D factory logistics game built with TypeScript, Three.js, and Vite.

## Overview

Future Factorius is a browser-based 3D factory game where you:
- Harvest raw materials from resource nodes
- Transport them to factories via routes
- Process them into valuable products
- Sell to trading partners for profit
- Research new technologies to expand your empire

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Desktop Development

```bash
npm run desktop:dev
```

This starts the Vite renderer and wraps it with Electron for local desktop testing.

## Tech Stack

### Why Three.js over Babylon.js?
Three.js was chosen because:
- Lighter weight and faster load times
- More granular control over rendering pipeline
- Better community support for custom low-poly aesthetics
- Excellent TypeScript types
- Simpler API for procedural geometry

### Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| three | ^0.183.0 | 3D rendering engine |
| vite | ^8.0.0 | Build tool & dev server |
| typescript | ^5.7.0 | Type safety |
| less | ^4.2.0 | CSS preprocessor |
| vitest | ^4.1.0 | Unit testing |
| @playwright/test | ^1.59.0 | E2E testing |

## Controls

### Camera
| Control | Action |
|---------|--------|
| Left click + drag | Orbit camera |
| Right click + drag | Pan camera |
| Scroll wheel | Zoom |
| WASD / Arrow keys | Pan camera |
| Q / E | Orbit left/right |
| F | Focus on selected building |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Space | Pause/resume |
| 1 / 2 / 4 | Game speed 1x/2x/4x |
| R | Open research tree |
| T | Open trade screen |
| M | Open routes screen |
| Escape | Close panels / deselect |

### Building Placement
1. Click a building type in the Build Menu
2. Click on the terrain to place it
3. Press Escape to cancel

### Route Creation
1. Click a building
2. Click "+ New Route" in the info panel
3. Click the destination building

## Gameplay

### Early Game
1. You start with a Wood Harvester and Coal Mine
2. Build a Basic Factory and connect it to your harvesters with routes
3. The factory will produce Basic Components (wood + coal)
4. Build a Trading Terminal and sell your components
5. Use profits to expand

### Mid Game
6. Research Silicon Extraction and build a Silicon Extractor
7. Build a Circuit Fabricator (silicon + water = circuits)
8. Build a Refinery (coal + water = fuel)
9. Circuits and fuel sell for much more at the Research Institute

### Late Game
10. Research Plasma Tech and Quantum Physics
11. Unlock the Exotic Lab for extremely valuable products
12. Research Antimatter Containment for the ultimate resources

## Architecture

```
src/
├── main.ts              # Entry point
├── game/
│   ├── Game.ts          # Main game orchestrator
│   ├── GameState.ts     # Central state types
│   ├── World.ts         # 3D scene management
│   ├── CameraController.ts  # Camera input & movement
│   └── SelectionManager.ts  # Building selection via raycasting
├── systems/
│   ├── ResourceSystem.ts    # Inventory management
│   ├── BuildingSystem.ts    # Building placement/upgrades
│   ├── ProductionSystem.ts  # Factory production ticks
│   ├── RouteSystem.ts       # Cargo transport
│   ├── EconomySystem.ts     # Cash, trading, maintenance
│   ├── ResearchSystem.ts    # Tech tree progression
│   ├── SaveSystem.ts        # localStorage persistence
│   └── AudioSystem.ts       # Procedural Web Audio sounds
├── data/
│   ├── resources.ts         # Resource type definitions
│   ├── buildings.ts         # Building type definitions
│   ├── recipes.ts           # Production recipes
│   ├── research.ts          # Technology tree
│   └── tradePartners.ts     # Trading partner data
├── graphics/
│   ├── RetroMaterials.ts    # Material factory
│   ├── ModelFactory.ts      # Procedural building models
│   └── Effects.ts           # Particle/route animations
├── ui/
│   └── UiController.ts      # UI event handling & updates
├── i18n/
│   ├── index.ts             # I18n singleton
│   └── locales/en.ts        # English translations
├── styles/
│   └── main.less            # Retro-futuristic LESS styles
└── tests/
    ├── __mocks__/three.ts   # Three.js mock for tests
    ├── testHelpers.ts        # Test utilities
    ├── e2e/                  # Playwright E2E tests
    └── *.test.ts             # Vitest unit tests
```

### Key Design Decisions
- **Deterministic ticks**: Simulation runs at 20 ticks/second, decoupled from render rate
- **Pure systems**: All systems are stateless functions taking/mutating GameState
- **Localization first**: All UI strings go through the I18n system
- **Versioned saves**: Save format includes version number with migration support

## Development Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run build:desktop   # Build the renderer with relative asset paths for Electron
npm run desktop:dev     # Run the Electron shell against the local Vite dev server
npm run desktop:pack    # Package the Electron app for the current platform
npm run desktop:pack:steam # Produce an unpacked build for Steam depot uploads
npm test           # Run unit tests
npm run test:e2e   # Run E2E tests (requires dev server or runs it automatically)
npm run preview    # Preview production build
```

## Desktop Saves

- Browser builds keep using `localStorage`
- Electron builds also store `future-factorius-save.json` in Electron's `userData` directory
- `npm run desktop:pack:steam` creates an unpacked build that is convenient for Steam depot packaging

## Resources

### Basic (Tier 1)
- 🪵 Wood - Harvested from Wood Harvesters
- ⚫ Coal - Mined from Coal Mines
- 🔩 Iron Ore - Mined from Iron Mines
- 💧 Water - Pumped from Water Pumps

### Intermediate (Tier 2)
- ⚙️ Steel - iron ore + coal → Smelter
- 🔧 Basic Components - wood + coal → Basic Factory
- 💡 Circuits - silicon + water → Circuit Fabricator
- ⛽ Fuel - coal + water → Refinery

### Advanced (Tier 3, requires research)
- 💎 Silicon - Silicon Extractor (research: Silicon Extraction)
- ☢️ Uranium - Uranium Extractor (research: Uranium Mining)
- 🔮 Plasma Crystals - (research: Plasma Tech)
- 🌑 Dark Matter Residue - (research: Dark Matter Research)
- 🌊 Quantum Foam - (research: Quantum Physics)
- 🧬 Synthetic Bio-Gel - (research: Biotech)
- ⚛️ Antimatter Particles - (research: Antimatter Containment)

## Buildings

| Building | Category | Produces | Cost |
|----------|----------|----------|------|
| Wood Harvester | Harvester | Wood | 100 |
| Coal Mine | Harvester | Coal | 150 |
| Iron Mine | Harvester | Iron Ore | 200 |
| Water Pump | Harvester | Water | 100 |
| Basic Factory | Factory | Components | 300 |
| Smelter | Factory | Steel | 400 |
| Circuit Fabricator | Factory | Circuits | 600 |
| Refinery | Factory | Fuel | 350 |
| Storage Depot | Storage | - | 200 |
| Research Center | Research | Research Points | 500 |
| Trading Terminal | Trade | - | 300 |
| Power Plant | Power | Power | 400 |
| Silicon Extractor | Harvester | Silicon | 800 |
| Uranium Extractor | Harvester | Uranium | 2000 |
| Exotic Lab | Factory | Exotic Goods | 5000 |

## Localization

All player-facing strings are in `src/i18n/locales/en.ts`. To add a new language:
1. Create `src/i18n/locales/[lang].ts` with the same structure
2. The I18n class will automatically load it when `setLocale('[lang]')` is called

## Save System

- Game auto-saves every minute
- Saves to `localStorage` under key `future_factorius_save`
- Versioned format with migration support
- Use the Menu screen to manually save/load/reset

## License

MIT
