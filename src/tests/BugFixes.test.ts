import { describe, it, expect } from 'vitest';
import { placeBuilding } from '../systems/BuildingSystem';
import { migrate } from '../systems/SaveSystem';
import { createTestGameState, createTestBuilding } from './testHelpers';

describe('v1.0.0 Bug Fixes', () => {
  describe('Building collision detection', () => {
    it('prevents placing a building too close to an existing one', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('basic_factory', { position: { x: 0, y: 0, z: 0 } })],
        cash: 100000
      });
      // Try to place another factory at (2, 0, 0) — within MIN_BUILDING_SEPARATION (4)
      const result = placeBuilding(state, 'basic_factory', { x: 2, y: 0, z: 0 });
      expect(result).toBeNull();
    });

    it('allows placing a building far from existing ones', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('basic_factory', { position: { x: 0, y: 0, z: 0 } })],
        cash: 100000
      });
      // (10, 0, 0) is beyond the 4-unit min separation
      const result = placeBuilding(state, 'basic_factory', { x: 10, y: 0, z: 0 });
      expect(result).not.toBeNull();
    });
  });

  describe('Save migration v4 → v5', () => {
    it('adds heat field to buildings without it', () => {
      const rawV4 = {
        version: 4,
        tick: 0,
        cash: 1000,
        buildings: [{ id: 'b1', typeId: 'basic_factory', level: 1, position: { x: 0, y: 0, z: 0 }, rotation: 0, health: 100, activeRecipeId: null, productionProgress: 0, inputBuffer: {}, outputBuffer: {}, isPowered: true, assignedRouteIds: [] }],
        routes: [],
        inventory: {},
        researchPoints: 0,
        completedResearch: [],
        tradeHistory: [],
        alerts: [],
        settings: { soundEnabled: false, musicEnabled: false, gamePaused: false, gameSpeed: 1, autosaveEnabled: false, autosaveIntervalMinutes: 1 },
        locale: 'en',
        worldSeed: 1,
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
      const migrated = migrate(rawV4, 4);
      expect(migrated.buildings[0]!.heat).toBe(0);
      expect(migrated.globalHeat).toBe(0);
      expect(migrated.heatCrisisTicks).toBe(0);
    });

    it('adds automationLevel to routes without it', () => {
      const rawV4 = {
        version: 4,
        tick: 0,
        cash: 1000,
        buildings: [],
        routes: [{ id: 'r1', fromBuildingId: 'a', toBuildingId: 'b', resourceId: 'wood', capacity: 10, speed: 5, currentLoad: 0, progress: 0, isActive: false, costPerTrip: 1 }],
        inventory: {},
        researchPoints: 0,
        completedResearch: [],
        tradeHistory: [],
        alerts: [],
        settings: { soundEnabled: false, musicEnabled: false, gamePaused: false, gameSpeed: 1, autosaveEnabled: false, autosaveIntervalMinutes: 1 },
        locale: 'en',
        worldSeed: 1,
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
      const migrated = migrate(rawV4, 4);
      expect(migrated.routes[0]!.automationLevel).toBe(0);
    });
  });
});
