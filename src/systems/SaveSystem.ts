import type { GameState, BuildingInstance } from '../game/GameState';
import { initialiseDemand } from './EconomySystem';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'future_factorius_save';

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

  // Future migration steps go here, e.g.:
  // if (fromVersion < 2) { state = migrateV1toV2(state); }
  void fromVersion; // acknowledged – no migrations needed yet

  state.version = SAVE_VERSION;
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
    cash: 1000,
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
      autosaveIntervalMinutes: 1,
    },
    locale,
    worldSeed: Math.floor(Math.random() * 1_000_000),
    demand: {},
  };

  // Place starting buildings directly (no cost deducted for a new game)
  state.buildings.push(makeBuilding('wood_harvester', { x: 0, y: 0, z: 0 }));
  state.buildings.push(makeBuilding('coal_mine', { x: 10, y: 0, z: 0 }));
  state.buildings.push(makeBuilding('trading_terminal', { x: 20, y: 0, z: 0 }));
  state.buildings.push(makeBuilding('storage_depot', { x: 30, y: 0, z: 0 }));

  initialiseDemand(state);

  return state;
}

/** Autosaves the game state (alias for save with a distinct call-site name). */
export function autosave(state: GameState): void {
  save(state);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBuilding(
  typeId: string,
  position: { x: number; y: number; z: number },
): BuildingInstance {
  return {
    id: crypto.randomUUID(),
    typeId,
    level: 1,
    position,
    rotation: 0,
    health: 100,
    activeRecipeId: null,
    productionProgress: 0,
    inputBuffer: {},
    outputBuffer: {},
    isPowered: true,
    assignedRouteIds: [],
  };
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
    researchPoints:
      typeof raw['researchPoints'] === 'number' ? raw['researchPoints'] : 0,
    inventory: isObject(raw['inventory'])
      ? (raw['inventory'] as Record<string, number>)
      : {},
    buildings: Array.isArray(raw['buildings'])
      ? (raw['buildings'] as BuildingInstance[])
      : defaults.buildings,
    routes: Array.isArray(raw['routes'])
      ? raw['routes']
      : [],
    activeResearch:
      isObject(raw['activeResearch']) && typeof raw['activeResearch']['technologyId'] === 'string'
        ? {
            technologyId: raw['activeResearch']['technologyId'] as string,
            progress:
              typeof raw['activeResearch']['progress'] === 'number'
                ? (raw['activeResearch']['progress'] as number)
                : 0,
            startedAt:
              typeof raw['activeResearch']['startedAt'] === 'number'
                ? (raw['activeResearch']['startedAt'] as number)
                : 0,
          }
        : null,
    completedResearch: Array.isArray(raw['completedResearch'])
      ? (raw['completedResearch'] as string[])
      : [],
    tradeHistory: Array.isArray(raw['tradeHistory'])
      ? raw['tradeHistory']
      : [],
    alerts: Array.isArray(raw['alerts']) ? raw['alerts'] : [],
    settings: isObject(raw['settings'])
      ? coerceSettings(raw['settings'])
      : defaults.settings,
    locale: typeof raw['locale'] === 'string' ? raw['locale'] : defaults.locale,
    worldSeed: typeof raw['worldSeed'] === 'number' ? raw['worldSeed'] : defaults.worldSeed,
    demand: isObject(raw['demand'])
      ? (raw['demand'] as Record<string, Record<string, number>>)
      : defaults.demand,
  };
}

function coerceSettings(raw: Record<string, unknown>): GameState['settings'] {
  return {
    soundEnabled: raw['soundEnabled'] !== false,
    musicEnabled: raw['musicEnabled'] !== false,
    gamePaused: raw['gamePaused'] === true,
    gameSpeed:
      raw['gameSpeed'] === 2 || raw['gameSpeed'] === 4
        ? (raw['gameSpeed'] as 2 | 4)
        : 1,
    autosaveEnabled: raw['autosaveEnabled'] !== false,
    autosaveIntervalMinutes:
      typeof raw['autosaveIntervalMinutes'] === 'number'
        ? raw['autosaveIntervalMinutes']
        : 1,
  };
}
