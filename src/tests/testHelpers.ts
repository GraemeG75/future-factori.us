import type { BuildingInstance, GameState } from '../game/GameState';
import { SAVE_VERSION } from '../systems/SaveSystem';
import { initialiseDemand } from '../systems/EconomySystem';

let _idCounter = 0;
function nextId(): string {
  return `test-building-${++_idCounter}`;
}

export function createTestBuilding(typeId: string, overrides: Partial<BuildingInstance> = {}): BuildingInstance {
  return {
    id: nextId(),
    typeId,
    level: 1,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    health: 100,
    activeRecipeId: null,
    productionProgress: 0,
    inputBuffer: {},
    outputBuffer: {},
    isPowered: true,
    assignedRouteIds: [],
    heat: 0,
    ...overrides
  };
}

export function createTestGameState(overrides: Partial<GameState> = {}): GameState {
  const state: GameState = {
    version: SAVE_VERSION,
    tick: 0,
    cash: 10000,
    researchPoints: 0,
    inventory: { wood: 100, coal: 100, iron_ore: 50 },
    buildings: [createTestBuilding('wood_harvester'), createTestBuilding('storage_depot')],
    routes: [],
    activeResearch: null,
    completedResearch: [],
    tradeHistory: [],
    alerts: [],
    settings: {
      soundEnabled: false,
      musicEnabled: false,
      gamePaused: false,
      gameSpeed: 1,
      autosaveEnabled: false,
      autosaveIntervalMinutes: 1
    },
    locale: 'en',
    worldSeed: 42,
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
    sandboxMode: false,
    globalHeat: 0,
    heatCrisisTicks: 0,
    ...overrides
  };
  initialiseDemand(state);
  return state;
}
