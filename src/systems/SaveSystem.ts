import type { GameState, BuildingInstance, ResourceSpot, Contract, Loan, MarketEvent } from '../game/GameState';
import { initialiseDemand } from './EconomySystem';
import { sampleTerrain, sampleTerrainHeight, type TerrainSample } from '../game/TerrainGeneration';

export const SAVE_VERSION = 4;
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

/** Candidate area half-size used for world generation (matches playable terrain extents). */
const SPOT_WORLD_HALF_EXTENT = 180;

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

const SPOT_HEIGHT_OFFSET: Record<string, { min: number; max: number }> = {
  wood_harvester: { min: 0.35, max: 0.62 },
  coal_mine: { min: 0.06, max: 0.22 },
  iron_mine: { min: 0.18, max: 0.4 },
  water_pump: { min: -0.28, max: -0.12 },
  silicon_extractor: { min: 0.15, max: 0.36 },
  uranium_extractor: { min: 0.24, max: 0.5 }
};

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function scoreInRange(value: number, min: number, max: number): number {
  if (value < min || value > max) return 0;
  const mid = (min + max) * 0.5;
  const half = (max - min) * 0.5;
  if (half <= 0) return 0;
  return 1 - Math.abs(value - mid) / half;
}

function getSpotHeight(typeId: string, terrainHeight: number, rng: () => number): number {
  const profile = SPOT_HEIGHT_OFFSET[typeId] ?? { min: 0.1, max: 0.3 };
  const offset = profile.min + rng() * (profile.max - profile.min);
  const y = terrainHeight + offset;
  return Math.round(y * 100) / 100;
}

function evaluateSpotFitness(typeId: string, sample: TerrainSample): number {
  switch (typeId) {
    case 'wood_harvester':
      return scoreInRange(sample.height, -0.2, 0.65) * scoreInRange(1 - sample.slope, 0.35, 1.0) * scoreInRange(sample.moisture, 0.35, 1.0);
    case 'coal_mine':
      return scoreInRange(sample.height, 0.2, 1.35) * scoreInRange(sample.slope, 0.22, 1.0) * scoreInRange(1 - sample.moisture, 0.3, 1.0);
    case 'iron_mine':
      return scoreInRange(sample.height, 0.05, 1.1) * scoreInRange(sample.slope, 0.14, 0.8) * scoreInRange(1 - sample.flow, 0.2, 1.0);
    case 'water_pump':
      return scoreInRange(sample.height, -0.9, 0.25) * scoreInRange(sample.flow, 0.32, 1.0) * scoreInRange(1 - sample.slope, 0.4, 1.0);
    case 'silicon_extractor':
      return scoreInRange(sample.height, 0.25, 1.2) * scoreInRange(sample.slope, 0.2, 0.9) * scoreInRange(1 - sample.moisture, 0.35, 1.0);
    case 'uranium_extractor':
      return scoreInRange(sample.height, 0.4, 1.5) * scoreInRange(sample.slope, 0.26, 1.0) * scoreInRange(sample.flow, 0.12, 0.9);
    default:
      return clamp01(sample.moisture * 0.5 + (1 - sample.slope) * 0.5);
  }
}

function isTooClose(spots: ResourceSpot[], x: number, z: number): boolean {
  return spots.some((s) => {
    const dx = s.position.x - x;
    const dz = s.position.z - z;
    return Math.sqrt(dx * dx + dz * dz) < SPOT_MIN_SEPARATION;
  });
}

function pickSpotCandidate(
  seed: number,
  typeId: string,
  existingSpots: ResourceSpot[],
  rng: () => number
): { x: number; z: number; sample: TerrainSample } | null {
  let best: { x: number; z: number; sample: TerrainSample; score: number } | null = null;
  const maxAttempts = 260;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = Math.round((rng() - 0.5) * (SPOT_WORLD_HALF_EXTENT * 2));
    const z = Math.round((rng() - 0.5) * (SPOT_WORLD_HALF_EXTENT * 2));
    if (isTooClose(existingSpots, x, z)) continue;

    const sample = sampleTerrain(seed, x, z);
    const baseScore = evaluateSpotFitness(typeId, sample);
    const jittered = baseScore + (rng() - 0.5) * 0.03;

    if (!best || jittered > best.score) {
      best = { x, z, sample, score: jittered };
      if (best.score > 0.9) break;
    }
  }

  return best ? { x: best.x, z: best.z, sample: best.sample } : null;
}

function normalizeResourceSpots(spots: ResourceSpot[], worldSeed: number): ResourceSpot[] {
  const rng = seededRng(worldSeed ^ 0x5f3759df);
  return spots.map((spot) => {
    const hasFlatLegacyY = Math.abs((spot.position?.y ?? 0) - 0) < 0.001;
    const terrainHeight = sampleTerrainHeight(worldSeed, spot.position.x, spot.position.z);
    return {
      ...spot,
      position: {
        x: spot.position.x,
        y: hasFlatLegacyY ? getSpotHeight(spot.buildingTypeId, terrainHeight, rng) : spot.position.y,
        z: spot.position.z
      }
    };
  });
}

/** Deterministically generates resource spots from the world seed. */
export function generateResourceSpots(seed: number): ResourceSpot[] {
  const rng = seededRng(seed);
  const spots: ResourceSpot[] = [];

  for (const [typeId, count] of Object.entries(HARVESTER_SPOT_COUNTS)) {
    let placed = 0;
    while (placed < count) {
      const candidate = pickSpotCandidate(seed, typeId, spots, rng);
      if (!candidate) break;

      const maxRemaining = Math.round(DEPOSIT_MIN + rng() * (DEPOSIT_MAX - DEPOSIT_MIN));
      spots.push({
        id: `spot_${typeId}_${placed}`,
        buildingTypeId: typeId,
        position: {
          x: candidate.x,
          y: getSpotHeight(typeId, candidate.sample.height, rng),
          z: candidate.z
        },
        occupiedByBuildingId: null,
        remaining: maxRemaining,
        maxRemaining
      });
      placed++;
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

  if (fromVersion < 4) {
    state = migrateV3toV4(state);
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

/** Patches a v3 state to add v0.6.0 / v0.7.0 fields. */
function migrateV3toV4(state: GameState): GameState {
  if (!('activeScenarioId' in state)) (state as GameState).activeScenarioId = null;
  if (!('scenarioStatus' in state)) (state as GameState).scenarioStatus = null;
  if (!('scenarioScore' in state)) (state as GameState).scenarioScore = 0;
  if (!('sandboxMode' in state)) (state as GameState).sandboxMode = false;
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
    activeScenarioId: null,
    scenarioStatus: null,
    scenarioScore: 0,
    sandboxMode: false
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
  const worldSeed = typeof raw['worldSeed'] === 'number' ? raw['worldSeed'] : defaults.worldSeed;
  const resourceSpots = Array.isArray(raw['resourceSpots'])
    ? normalizeResourceSpots(raw['resourceSpots'] as ResourceSpot[], worldSeed)
    : generateResourceSpots(worldSeed);

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
    worldSeed,
    demand: isObject(raw['demand']) ? (raw['demand'] as Record<string, Record<string, number>>) : defaults.demand,
    resourceSpots,
    pollution: typeof raw['pollution'] === 'number' ? raw['pollution'] : 0,
    unlockedAchievements: Array.isArray(raw['unlockedAchievements']) ? (raw['unlockedAchievements'] as string[]) : [],
    contracts: Array.isArray(raw['contracts']) ? (raw['contracts'] as Contract[]) : [],
    loans: Array.isArray(raw['loans']) ? (raw['loans'] as Loan[]) : [],
    priceHistory: isObject(raw['priceHistory']) ? (raw['priceHistory'] as Record<string, Record<string, number[]>>) : {},
    activeMarketEvents: Array.isArray(raw['activeMarketEvents']) ? (raw['activeMarketEvents'] as MarketEvent[]) : [],
    researchSpecialization:
      raw['researchSpecialization'] === 'energy' || raw['researchSpecialization'] === 'matter' || raw['researchSpecialization'] === 'biology'
        ? (raw['researchSpecialization'] as 'energy' | 'matter' | 'biology')
        : null,
    activeScenarioId: typeof raw['activeScenarioId'] === 'string' ? raw['activeScenarioId'] : null,
    scenarioStatus:
      raw['scenarioStatus'] === 'active' || raw['scenarioStatus'] === 'won' || raw['scenarioStatus'] === 'lost'
        ? (raw['scenarioStatus'] as 'active' | 'won' | 'lost')
        : null,
    scenarioScore: typeof raw['scenarioScore'] === 'number' ? raw['scenarioScore'] : 0,
    sandboxMode: raw['sandboxMode'] === true
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
