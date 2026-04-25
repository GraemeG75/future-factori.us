# TODO — Future Factorius

This file tracks current known issues and planned improvements. See ROADMAP.md for the long-term feature roadmap.

## 🐛 Bug Fixes

- [ ] Camera pan with right-click may trigger browser context menu — add `e.preventDefault()` to right-click handler
- [ ] Building placement grid snap may place buildings on top of each other — add collision detection
- [ ] Route cargo capsule may briefly appear at world origin on creation
- [ ] Research screen layout may overflow on small screens (< 1024px wide)
- [ ] Auto-save may write too frequently if state changes rapidly (debounce needed)

## 🎮 Missing Features

- [ ] Building tooltips on hover in the build menu (show cost, resource requirements)
- [ ] Confirm dialog before demolishing a building
- [ ] Route capacity visual indicator (how full the route is)
- [ ] Research point display in the top bar (alongside cash)
- [ ] Building upgrade visual feedback (flash/particle effect on upgrade)
- [ ] "Not enough cash" visual feedback when attempting to build/upgrade
- [ ] Route throughput display in routes screen
- [ ] Export/import save data as file
- [ ] Tutorial / help overlay for first-time players
- [ ] Minimap for large factories

## ⚙️ Technical Improvements

- [ ] Code-split Three.js to reduce initial bundle size (~600KB)
- [ ] Add proper event bus instead of direct callbacks between game and UI
- [ ] Refactor `UiController.ts` into smaller focused modules
- [ ] Add proper error handling for WebGL context loss
- [ ] Add loading screen while Three.js initializes
- [ ] Implement proper game loop with `requestAnimationFrame` cancelation on dispose
- [ ] Use `ResizeObserver` for canvas resize handling instead of window.resize event

## 🧪 Testing Gaps

- [ ] Test that route throughput correctly limits production
- [ ] Test economy demand fluctuation over time
- [ ] Test building upgrade cost calculation
- [ ] Test power grid logic (buildings offline without power)
- [ ] Integration tests for full gameplay loop (harvest → process → sell)
- [ ] E2E test for building placement flow
- [ ] E2E test for route creation flow
- [ ] E2E test for research completion

## 🌍 Localization

- [ ] Add French locale
- [ ] Add German locale  
- [ ] Add Spanish locale
- [ ] Add language selector in settings/menu screen
- [ ] Verify all dynamic strings (alert messages with params) are localized

## 🎨 Visual Polish

- [ ] Add building animation (pulsing lights, spinning parts)
- [ ] Better cargo capsule (shaped like resource type)
- [ ] Selection highlight shader effect
- [ ] Route path curve (bezier curve instead of straight line)
- [ ] Building shadow casting
- [ ] Retro scanline CRT effect on UI panels
- [ ] Background star field / space environment

## 📦 Build & Infrastructure

- [ ] Set up GitHub Actions CI pipeline (lint + test + build)
- [ ] Add ESLint configuration
- [ ] Configure Prettier for code formatting
- [ ] Set up automatic dependency updates (Renovate/Dependabot)
- [ ] Add bundle size check in CI
