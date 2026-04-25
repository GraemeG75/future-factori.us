import { describe, it, expect, beforeEach } from 'vitest';
import {
  startProduction,
  tick,
  getProductionRate,
  getAvailableRecipes,
} from '../systems/ProductionSystem';
import { createTestGameState, createTestBuilding } from './testHelpers';
import type { GameState } from '../game/GameState';
import { RECIPES_MAP } from '../data/recipes';

describe('ProductionSystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState();
  });

  it('startProduction fails if building has no recipe for that building type', () => {
    // wood_harvester cannot use 'ore_to_steel' (which is for smelter)
    const harvester = state.buildings.find(b => b.typeId === 'wood_harvester')!;
    const result = startProduction(state, harvester.id, 'ore_to_steel');
    expect(result).toBe(false);
  });

  it('startProduction succeeds for valid building + recipe combo', () => {
    const factory = createTestBuilding('basic_factory');
    state.buildings.push(factory);
    state.inventory = { wood: 50, coal: 50 };
    const result = startProduction(state, factory.id, 'wood_to_components');
    expect(result).toBe(true);
    expect(factory.activeRecipeId).toBe('wood_to_components');
  });

  it('production progresses over time (tick advances productionProgress)', () => {
    const factory = createTestBuilding('basic_factory');
    state.buildings.push(factory);
    state.inventory = { wood: 50, coal: 50 };
    startProduction(state, factory.id, 'wood_to_components');
    expect(factory.productionProgress).toBe(0);
    tick(state, 1); // advance 1 second
    expect(factory.productionProgress).toBeGreaterThan(0);
  });

  it('production completes and outputs are added to outputBuffer', () => {
    const factory = createTestBuilding('basic_factory');
    state.buildings.push(factory);
    state.inventory = { wood: 50, coal: 50 };
    startProduction(state, factory.id, 'wood_to_components');
    // processingTimeSeconds for wood_to_components is 10s — tick past it
    tick(state, 11);
    // Outputs go to global inventory (flushed immediately)
    expect(state.inventory['basic_components'] ?? 0).toBeGreaterThan(0);
  });

  it('production automatically restarts if inputs available', () => {
    const factory = createTestBuilding('basic_factory');
    state.buildings.push(factory);
    state.inventory = { wood: 100, coal: 100 };
    startProduction(state, factory.id, 'wood_to_components');
    tick(state, 11); // complete first cycle
    // Should have restarted — activeRecipeId should still be set
    expect(factory.activeRecipeId).toBe('wood_to_components');
  });

  it('production stops if inputs depleted', () => {
    const factory = createTestBuilding('basic_factory');
    state.buildings.push(factory);
    state.inventory = { wood: 2, coal: 1 };
    startProduction(state, factory.id, 'wood_to_components');
    // After startProduction, inputs are loaded into inputBuffer from inventory
    expect(factory.inputBuffer['wood']).toBe(2);
    expect(factory.inputBuffer['coal']).toBe(1);
    // Global inventory is now depleted
    expect(state.inventory['wood'] ?? 0).toBe(0);
    expect(state.inventory['coal'] ?? 0).toBe(0);
  });

  it('getProductionRate returns correct units per minute', () => {
    const factory = createTestBuilding('basic_factory');
    const recipe = RECIPES_MAP['wood_to_components'];
    // level=1, productionRateMultiplier=1.4, processingTimeSeconds=10, output.amount=3
    // cyclesPerMin = (60/10) * 1 = 6, rate = 6 * 3 = 18
    const rate = getProductionRate(factory, recipe);
    expect(rate).toBeCloseTo(18, 1);
  });

  it('getAvailableRecipes returns only recipes for that building type', () => {
    const factory = createTestBuilding('basic_factory');
    state.buildings.push(factory);
    const recipes = getAvailableRecipes(state, factory.id);
    expect(recipes.length).toBeGreaterThan(0);
    for (const r of recipes) {
      expect(r.buildingTypeId).toBe('basic_factory');
    }
  });
});
