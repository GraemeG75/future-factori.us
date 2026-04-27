# Future Factorius — Roadmap

## v0.1.0 — Initial Vertical Slice ✅

### Completed
- **Project bootstrap**: Vite 8 + TypeScript 5.7 + Three.js 0.183 + LESS
- **Localization system**: I18n singleton with English locale, dot-notation keys, placeholder substitution
- **Data definitions**: 20+ resources (basic → exotic), 15 building types, 11 recipes, 10 technologies, 4 trading partners
- **Core systems**:
  - ResourceSystem — inventory management
  - BuildingSystem — placement, upgrades, power
  - ProductionSystem — factory tick-based processing
  - RouteSystem — animated cargo transport
  - EconomySystem — cash, maintenance, trade demand fluctuation
  - ResearchSystem — tech tree with prerequisites
  - SaveSystem — versioned localStorage with migration support
  - AudioSystem — procedural Web Audio sounds (no external files)
- **3D World**: Three.js scene with procedural low-poly building models, terrain grid, neon route lines, retro materials
- **Camera**: Orbit/pan/zoom with mouse and WASD/arrow keys, smooth lerp interpolation
- **Selection**: Raycaster-based building selection with floating selection ring
- **Effects**: Cargo capsule animations, building pulses, research burst particles
- **UI**: Top bar (resources, cash, speed), build menu, info panel, research tree, trade screen, routes screen, save/load menu
- **Unit tests**: 61 tests across 7 test files (Vitest)
- **E2E tests**: Playwright smoke tests for all major screens
- **Save/Load**: New game, save, load, autosave, reset with versioned format

### Known Issues
- Three.js bundle is ~600KB (mostly Three.js itself) — can be improved with dynamic imports
- Camera pan with right-click may conflict with browser context menu on some systems
- Mobile/touch controls not yet implemented
- Building placement snapping could be smoother
- Some extreme late-game resources have no visual distinctions yet

---

## v0.2.0 — Visual Polish & Audio ✅

### Completed
- **Richer building animations**: Spinning fans (power plant, trading terminal), blinking indicator lights on all buildings, smoke particles rising from chimneys (coal mine, smelter, refinery)
- **Ambient background music**: Richer procedural synth loop — drone layer (A-minor pentatonic), pad notes with slow attack/release envelopes, stereo shimmer; 6-second looping buffer
- **Better route cargo visualization**: Three evenly-spaced cargo capsules per route instead of one
- **Building level visual upgrades**: Glowing base ring at level 2+, status beacon at level 3+, increased emissive intensity per level, 15% larger scale per level (up from 10%)
- **Improved terrain**: Layered sine-wave height map for smooth biome-like hills; vertex-colored biomes (industrial centre, earthy mid-ring, rocky outer rim)
- **Day/night cycle**: Dynamic ambient and directional light animation over a 5-minute cycle; warm dawn/dusk hues, cool noon light, deep-indigo night; sky/fog color updates in sync
- **Shadows**: PCFSoftShadowMap enabled; all building meshes cast & receive shadows; terrain receives shadows; 2048×2048 shadow map with properly sized frustum

---

## v0.3.0 — Gameplay Depth ✅

### Completed
- **Power grid system**: `updatePowerState` called every tick — buildings go offline when power demand exceeds supply; power production/consumption displayed in the top bar
- **Building health & maintenance events**: Gradual wear-and-tear health drain; random breakdown events; `repairBuilding` function with cost scaling; health bar in info panel; repair button in UI
- **Supply chain efficiency ratings**: `getBuildingEfficiency` returns 0–1 factor based on power + health; displayed in building info panel
- **Resource scarcity**: Each `ResourceSpot` now has `remaining` and `maxRemaining` deposit fields; harvesters deplete deposits over time; low-deposit alerts fire at 10%; harvester stops when deposit is exhausted
- **Environmental pollution**: Factories accumulate global pollution (0–100) per production cycle; natural decay over time; pollution suppresses trade prices (up to −50% at max pollution); top-bar pollution indicator with color coding
- **Achievements system**: `AchievementSystem` with 14 achievements tracking buildings, cash, trades, research, routes, repairs, and pollution; achievement unlock alerts; Achievements screen accessible from the bottom nav
- **Save migration**: SAVE_VERSION bumped to 2 with v1→v2 migration adding `pollution`, `unlockedAchievements`, and `remaining`/`maxRemaining` to resource spots
- **Unit tests**: +25 tests (12 MaintenanceSystem, 13 AchievementSystem) — 87 total

### Known Issues / Deferred
- Worker units (animated humanoid figures on routes) — deferred to v0.3.1 (complex visual)
- Multiple world zones — deferred to v0.4.0 as part of Economy expansion

---

## v0.4.0 — Economy & Trade Expansion ✅

### Completed
- **Dynamic demand simulation**: Price curves tracked over time; `priceHistory` sampled every 30 s; sparklines rendered in the Trade screen
- **Contract system**: `ContractSystem` generates timed delivery contracts from trade partners; `fulfillContract` consumes inventory and pays reward; expired contracts apply a penalty
- **Import/export with new trade partners**: 2 additional partners added (Black Market, Terraformers Collective) for a total of 6
- **Stock market-style price display**: Sparkline canvas charts per resource/partner pair in the Trade screen
- **Loan/investment system**: `LoanSystem` with 4 loan tiers; interest accrual; repayment; overdue penalties; Finance screen Loans tab
- **Operating expenses breakdown UI**: Finance screen with Contracts / Loans / Market Events tabs
- **Tax/regulation events**: `EventSystem` spawns random market events (embargo, boom, crash, subsidy, tech surge, pollution fine); active events visible in Finance screen

---

## v0.5.0 — Research & Progression ✅

### Completed
- **More technology tiers (Tier 5: Post-Singularity)**: 3 Tier-5 techs added — Singularity Engine (energy), Consciousness Upload (biology), Reality Engineering (matter)
- **Research specialization trees**: `energy`, `matter`, `biology` branches on relevant techs; specialization selector panel in the Research screen; `getEffectiveSpecialization` auto-detects from highest-tier completed tech
- **Technology cards with flavor text**: Description/flavor text rendered on every tech card in the Research tree; specialization badge and synergy callout shown on applicable cards
- **Cross-technology synergies**: `getSynergyBonus` multiplies production for buildings when all synergy-partner techs are complete; active bonuses displayed in the Research specialization panel
- **Prototype buildings (unlock by combining technologies)**: 6 prototype-class structures (Quantum Forge, Fusion Plant, Bio Reactor, Singularity Tap, Mind Matrix, Reality Forge) added to the PROTOTYPES section of the build menu; each requires a Tier-4/5 research unlock
- **Achievements**: 3 new v0.5.0 achievements (tier5_research, synergy_active, prototype_built) tracked by `AchievementSystem`
- **Unit tests**: 8 new tests (getSynergyBonus × 4, getEffectiveSpecialization × 4) — 132 total

---

## v0.6.0 — Additional Languages

- [ ] French locale
- [ ] German locale
- [ ] Spanish locale
- [ ] Japanese locale
- [ ] Chinese (Simplified) locale
- [ ] Language selector in settings menu

---

## v0.7.0 — Campaign / Scenario Mode

- [ ] Tutorial mission (guided gameplay)
- [ ] Scenario challenges (time limits, resource constraints)
- [ ] Sandbox mode (unlimited starting resources)
- [ ] Leaderboard/score system

---

## v1.0.0 — Release

- [ ] All known bugs fixed
- [ ] Performance optimized (60fps on mid-range hardware)
- [ ] Comprehensive documentation
- [ ] Steam/Electron desktop packaging
- [ ] Mobile/tablet responsive UI

---

## Long-Term Future Expansion

### Advanced Gameplay
- **Pollution system**: Factories produce pollution, affecting resource quality and trade relationships
- **Heat management**: Exotic factories require cooling systems
- **Risk events**: Reactor meltdowns, market crashes, supply disruptions
- **Automation**: Bots and drones for fully automated factories

### Multiplayer
- **Async trading**: Trade with other players' economies
- **Shared market**: Real-time supply/demand with other players
- **Cooperative mode**: Build shared supply chains

### Mod Support
- Plugin API for custom resources/buildings/recipes
- Steam Workshop integration
- Mod manager UI

### Platform Expansion
- Mobile-optimized UI (touch gestures, larger buttons)
- Electron desktop app with file-based saves
- PWA (installable web app)

### Visual Enhancement
- High-quality 3D models (replace procedural with artist-made assets)
- Real-time reflections
- Weather system
- Custom skybox per biome

---

## Technical Debt

- [ ] Refactor `UiController.ts` into smaller panel components
- [ ] Add proper event system instead of direct callbacks
- [ ] Implement entity-component system for more flexible game objects
- [ ] Add proper logging system
- [ ] Performance profiling and optimization for large factories
- [ ] Better error boundaries in UI
- [ ] Comprehensive TypeScript strict mode audit
