import type { GameState, BuildingInstance, ResourceSpot, Contract, Loan, MarketEvent } from '../game/GameState';
import { initialiseDemand } from './EconomySystem';

export const SAVE_VERSION = 3;
export const SAVE_KEY = 'future_factorius_save';
/** Starting cash for a fresh game. */
export const STARTING_CASH = 2500;

// ---------------------------------------------------------------------------
// Resource spot generation
// ---------------------------------------------------------------------------

/** Harvester type -> number of spots to generate in the world. */
const HARVESTER_SPOT_COUNTS: Record<string, number> = {
  wood_harvester: 6,
  coal_mine: 4,
  iron_mine: 4,
  water_pump: 3
};

/** Minimum world-unit separation between any two spots. */
const SPOT_MIN_SEPARATION = 12;

/** Simple seeded LCG random number generator returning values in [0, 1). */
function seededRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

/** Minimum deposit size (units) for any resource spot. */
const DEPOSIT_MIN = 3000;
/** Maximum deposit size (units) for any resource spot. */
const DEPOSIT_MAX = 15000;

/** Deterministically generates resource spots from the world seed. */
export function generateResourceSpots(seed: number): ResourceSpot[] {
  const rng = seededRng(seed);
  const spots: ResourceSpot[] = [];

  for (const [typeId, count] of Object.entries(HARVESTER_SPOT_COUNTS)) {
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 30) {
      attempts++;
      const x = Math.round((rng() - 0.5) * 160); // -80 to +80
      const z = Math.round((rng() - 0.5) * 160);
      const tooClose = spots.some((s) => {
        const dx = s.position.x - x;
        const dz = s.position.z - z;
        return Math.sqrt(dx * dx + dz * dz) < SPOT_MIN_SEPARATION;
      });
      if (!tooClose) {
        const maxRemaining = Math.round(DEPOSIT_MIN + rng() * (DEPOSIT_MAX - DEPOSIT_MIN));
        spots.push({
          id: `spot_${typeId}_${placed}`,
          buildingTypeId: typeId,
          position: { x, y: 0, z },
          occupiedByBuildingId: null,
          remaining: maxRemaining,
          maxRemaining,
        });
        placed++;
      }
    }
  }

  return spots;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Serialises the current game state to localStorage. */
export function save(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode, quota exceeded, etc.)
  }
}

/**
 * Loads and migrates a saved game from localStorage.
 * Returns null if no save exists or the data is unrecoverable.
 */
export function load(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return null;
    const version = typeof parsed['version'] === 'number' ? parsed['version'] : 0;
    return migrate(parsed, version);
  } catch {
    return null;
  }
}

/** Removes the saved game from localStorage. */
export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

/** Returns true if a save exists in localStorage. */
export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Migrates a raw save object from an older version to the current GameState
 * format. Applies patches sequentially for each version gap.
 */
export function migrate(data: unknown, fromVersion: number): GameState {
  if (!isObject(data)) return createNewGame();

  let state = coerceToGameState(data);

  if (fromVersion < 2) {
    state = migrateV1toV2(state);
  }

  if (fromVersion < 3) {
    state = migrateV2toV3(state);
  }

  state.version = SAVE_VERSION;
  return state;
}

/** Patches a v1 state to add v0.3.0 fields. */
function migrateV1toV2(state: GameState): GameState {
  // Add new top-level fields
  if (!('pollution' in state)) (state as GameState).pollution = 0;
  if (!('unlockedAchievements' in state)) (state as GameState).unlockedAchievements = [];
  // Add remaining/maxRemaining to any resource spots that lack them
  for (const spot of state.resourceSpots) {
    if (!('remaining' in spot)) {
      (spot as ResourceSpot).remaining = 10000;
      (spot as ResourceSpot).maxRemaining = 10000;
    }
  }
  return state;
}

/** Patches a v2 state to add v0.4.0 / v0.5.0 fields. */
function migrateV2toV3(state: GameState): GameState {
  if (!('contracts' in state)) (state as GameState).contracts = [];
  if (!('loans' in state)) (state as GameState).loans = [];
  if (!('priceHistory' in state)) (state as GameState).priceHistory = {};
  if (!('activeMarketEvents' in state)) (state as GameState).activeMarketEvents = [];
  if (!('researchSpecialization' in state)) (state as GameState).researchSpecialization = null;
  return state;
}

/**
 * Creates a fresh GameState with starting resources and buildings at default
 * world positions.
 */
export function createNewGame(locale = 'en'): GameState {
  const state: GameState = {
    version: SAVE_VERSION,
    tick: 0,
    cash: STARTING_CASH,
    researchPoints: 0,
    inventory: {},
    buildings: [],
    routes: [],
    activeResearch: null,
    completedResearch: [],
    tradeHistory: [],
    alerts: [],
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      gamePaused: false,
      gameSpeed: 1,
      autosaveEnabled: true,
      autosaveIntervalMinutes: 1
    },
    locale,
    worldSeed: Math.floor(Math.random() * 1_000_000),
    demand: {},
    resourceSpots: [],
    pollution: 0,
    unlockedAchievements: [],
    contracts: [],
    loans: [],
    priceHistory: {},
    activeMarketEvents: [],
    researchSpecialization: null,
  };

  state.resourceSpots = generateResourceSpots(state.worldSeed);
  initialiseDemand(state);

  return state;
}

/** Autosaves the game state (alias for save with a distinct call-site name). */
export function autosave(state: GameState): void {
  save(state);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Coerces a raw parsed object into a valid GameState, filling in any missing
 * fields with sane defaults from a fresh new game.
 */
function coerceToGameState(raw: Record<string, unknown>): GameState {
  const defaults = createNewGame();

  return {
    version: typeof raw['version'] === 'number' ? raw['version'] : defaults.version,
    tick: typeof raw['tick'] === 'number' ? raw['tick'] : 0,
    cash: typeof raw['cash'] === 'number' ? raw['cash'] : defaults.cash,
    researchPoints: typeof raw['researchPoints'] === 'number' ? raw['researchPoints'] : 0,
    inventory: isObject(raw['inventory']) ? (raw['inventory'] as Record<string, number>) : {},
    buildings: Array.isArray(raw['buildings']) ? (raw['buildings'] as BuildingInstance[]) : defaults.buildings,
    routes: Array.isArray(raw['routes']) ? raw['routes'] : [],
    activeResearch:
      isObject(raw['activeResearch']) && typeof raw['activeResearch']['technologyId'] === 'string'
        ? {
            technologyId: raw['activeResearch']['technologyId'] as string,
            progress: typeof raw['activeResearch']['progress'] === 'number' ? (raw['activeResearch']['progress'] as number) : 0,
            startedAt: typeof raw['activeResearch']['startedAt'] === 'number' ? (raw['activeResearch']['startedAt'] as number) : 0
          }
        : null,
    completedResearch: Array.isArray(raw['completedResearch']) ? (raw['completedResearch'] as string[]) : [],
    tradeHistory: Array.isArray(raw['tradeHistory']) ? raw['tradeHistory'] : [],
    alerts: Array.isArray(raw['alerts']) ? raw['alerts'] : [],
    settings: isObject(raw['settings']) ? coerceSettings(raw['settings']) : defaults.settings,
    locale: typeof raw['locale'] === 'string' ? raw['locale'] : defaults.locale,
    worldSeed: typeof raw['worldSeed'] === 'number' ? raw['worldSeed'] : defaults.worldSeed,
    demand: isObject(raw['demand']) ? (raw['demand'] as Record<string, Record<string, number>>) : defaults.demand,
    resourceSpots: Array.isArray(raw['resourceSpots'])
      ? (raw['resourceSpots'] as ResourceSpot[])
      : generateResourceSpots(typeof raw['worldSeed'] === 'number' ? raw['worldSeed'] : defaults.worldSeed),
    pollution: typeof raw['pollution'] === 'number' ? raw['pollution'] : 0,
    unlockedAchievements: Array.isArray(raw['unlockedAchievements'])
      ? (raw['unlockedAchievements'] as string[])
      : [],
    contracts: Array.isArray(raw['contracts']) ? (raw['contracts'] as Contract[]) : [],
    loans: Array.isArray(raw['loans']) ? (raw['loans'] as Loan[]) : [],
    priceHistory: isObject(raw['priceHistory'])
      ? (raw['priceHistory'] as Record<string, Record<string, number[]>>)
      : {},
    activeMarketEvents: Array.isArray(raw['activeMarketEvents'])
      ? (raw['activeMarketEvents'] as MarketEvent[])
      : [],
    researchSpecialization:
      raw['researchSpecialization'] === 'energy' ||
      raw['researchSpecialization'] === 'matter' ||
      raw['researchSpecialization'] === 'biology'
        ? (raw['researchSpecialization'] as 'energy' | 'matter' | 'biology')
        : null,
  };
}

function coerceSettings(raw: Record<string, unknown>): GameState['settings'] {
  return {
    soundEnabled: raw['soundEnabled'] !== false,
    musicEnabled: raw['musicEnabled'] !== false,
    gamePaused: raw['gamePaused'] === true,
    gameSpeed: raw['gameSpeed'] === 2 || raw['gameSpeed'] === 4 ? (raw['gameSpeed'] as 2 | 4) : 1,
    autosaveEnabled: raw['autosaveEnabled'] !== false,
    autosaveIntervalMinutes: typeof raw['autosaveIntervalMinutes'] === 'number' ? raw['autosaveIntervalMinutes'] : 1
  };
}
