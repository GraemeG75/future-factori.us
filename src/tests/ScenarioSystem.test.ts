import { describe, it, expect, beforeEach } from 'vitest';
import * as ScenarioSystem from '../systems/ScenarioSystem';
import { createTestGameState } from './testHelpers';
import type { GameState } from '../game/GameState';
import type { ScenarioObjective } from '../data/scenarios';

function makeObjective(overrides: Partial<ScenarioObjective>): ScenarioObjective {
  return {
    id: 'test_obj',
    descriptionKey: 'test.obj',
    type: 'cash',
    target: 1000,
    ...overrides,
  };
}

describe('ScenarioSystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState();
  });

  // checkObjective
  it('checkObjective cash returns true when cash >= target', () => {
    state.cash = 1000;
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'cash', target: 500 }))).toBe(true);
  });

  it('checkObjective cash returns false when cash < target', () => {
    state.cash = 100;
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'cash', target: 500 }))).toBe(false);
  });

  it('checkObjective buildings uses buildings array length', () => {
    state.buildings = [];
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'buildings', target: 1 }))).toBe(false);
    state.buildings = [{ id: 'b1', typeId: 'sawmill', x: 0, y: 0, z: 0, rotation: 0, level: 1, isOperational: true }];
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'buildings', target: 1 }))).toBe(true);
  });

  it('checkObjective research checks completedResearch length', () => {
    state.completedResearch = ['a', 'b'];
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'research', target: 2 }))).toBe(true);
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'research', target: 3 }))).toBe(false);
  });

  it('checkObjective contracts counts completed contracts', () => {
    state.contracts = [
      { id: 'c1', fromCity: 'A', toCity: 'B', resourceId: 'wood', amount: 10, reward: 100, penaltyPerTick: 0, deadlineTick: 99999, status: 'completed', acceptedTick: 0 },
      { id: 'c2', fromCity: 'A', toCity: 'B', resourceId: 'wood', amount: 10, reward: 100, penaltyPerTick: 0, deadlineTick: 99999, status: 'active', acceptedTick: 0 },
    ];
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'contracts', target: 1 }))).toBe(true);
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'contracts', target: 2 }))).toBe(false);
  });

  it('checkObjective trade checks tradeHistory length', () => {
    state.tradeHistory = [{ tick: 1, resourceId: 'wood', amount: 5, price: 10, type: 'sell' }];
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'trade', target: 1 }))).toBe(true);
    expect(ScenarioSystem.checkObjective(state, makeObjective({ type: 'trade', target: 2 }))).toBe(false);
  });

  // areAllObjectivesComplete
  it('areAllObjectivesComplete returns false when no active scenario', () => {
    state.activeScenarioId = null;
    expect(ScenarioSystem.areAllObjectivesComplete(state)).toBe(false);
  });

  it('areAllObjectivesComplete returns false when some objectives incomplete', () => {
    state.activeScenarioId = 'tutorial';
    state.cash = 100;
    state.buildings = [];
    state.completedResearch = [];
    expect(ScenarioSystem.areAllObjectivesComplete(state)).toBe(false);
  });

  it('areAllObjectivesComplete returns true when all objectives met for tutorial', () => {
    state.activeScenarioId = 'tutorial';
    state.cash = 10000;
    state.buildings = [
      { id: 'b1', typeId: 'sawmill', x: 0, y: 0, z: 0, rotation: 0, level: 1, isOperational: true },
      { id: 'b2', typeId: 'sawmill', x: 1, y: 0, z: 0, rotation: 0, level: 1, isOperational: true },
      { id: 'b3', typeId: 'sawmill', x: 2, y: 0, z: 0, rotation: 0, level: 1, isOperational: true },
    ];
    state.completedResearch = ['silicon_extraction'];
    expect(ScenarioSystem.areAllObjectivesComplete(state)).toBe(true);
  });

  // isTimedOut
  it('isTimedOut returns false when no scenario', () => {
    state.activeScenarioId = null;
    expect(ScenarioSystem.isTimedOut(state)).toBe(false);
  });

  it('isTimedOut returns false for scenario with no time limit', () => {
    state.activeScenarioId = 'tutorial';
    state.tick = 999999;
    expect(ScenarioSystem.isTimedOut(state)).toBe(false);
  });

  it('isTimedOut returns true when tick >= timeLimitTicks', () => {
    state.activeScenarioId = 'fast_start';
    state.tick = 72000;
    expect(ScenarioSystem.isTimedOut(state)).toBe(true);
  });

  it('isTimedOut returns false before time limit', () => {
    state.activeScenarioId = 'fast_start';
    state.tick = 71999;
    expect(ScenarioSystem.isTimedOut(state)).toBe(false);
  });

  // calculateScore
  it('calculateScore applies scenario multiplier', () => {
    state.activeScenarioId = 'fast_start'; // multiplier 1.5
    state.cash = 10000;
    state.contracts = [];
    state.completedResearch = [];
    const base = Math.floor(10000 / 10);
    const expected = Math.floor(base * 1.5);
    expect(ScenarioSystem.calculateScore(state)).toBe(expected);
  });

  it('calculateScore includes completed contracts and research', () => {
    state.activeScenarioId = 'tutorial'; // multiplier 1.0
    state.cash = 0;
    state.contracts = [
      { id: 'c1', fromCity: 'A', toCity: 'B', resourceId: 'wood', amount: 10, reward: 100, penaltyPerTick: 0, deadlineTick: 99999, status: 'completed', acceptedTick: 0 },
    ];
    state.completedResearch = ['a'];
    const expected = 500 + 200; // 1 contract × 500 + 1 research × 200
    expect(ScenarioSystem.calculateScore(state)).toBe(expected);
  });

  // startScenario
  it('startScenario sets activeScenarioId and status', () => {
    ScenarioSystem.startScenario(state, 'tutorial');
    expect(state.activeScenarioId).toBe('tutorial');
    expect(state.scenarioStatus).toBe('active');
    expect(state.scenarioScore).toBe(0);
  });

  it('startScenario applies startingCash', () => {
    ScenarioSystem.startScenario(state, 'tutorial');
    expect(state.cash).toBe(5000);
  });

  it('startScenario adds to inventory without replacing existing', () => {
    state.inventory['wood'] = 10;
    ScenarioSystem.startScenario(state, 'tutorial');
    expect(state.inventory['wood']).toBe(60); // 10 existing + 50 starting
  });

  it('startScenario adds research without duplicates', () => {
    state.completedResearch = ['fast_routes'];
    ScenarioSystem.startScenario(state, 'fast_start');
    const count = state.completedResearch.filter(r => r === 'fast_routes').length;
    expect(count).toBe(1);
  });

  it('startScenario sets sandboxMode for sandbox scenario', () => {
    ScenarioSystem.startScenario(state, 'sandbox');
    expect(state.sandboxMode).toBe(true);
  });

  it('startScenario returns false for unknown id', () => {
    const result = ScenarioSystem.startScenario(state, 'nonexistent');
    expect(result).toBe(false);
  });

  // tick transitions
  it('tick transitions to won when all objectives complete', () => {
    state.activeScenarioId = 'tutorial';
    state.scenarioStatus = 'active';
    state.cash = 10000;
    state.buildings = [
      { id: 'b1', typeId: 'sawmill', x: 0, y: 0, z: 0, rotation: 0, level: 1, isOperational: true },
      { id: 'b2', typeId: 'sawmill', x: 1, y: 0, z: 0, rotation: 0, level: 1, isOperational: true },
      { id: 'b3', typeId: 'sawmill', x: 2, y: 0, z: 0, rotation: 0, level: 1, isOperational: true },
    ];
    state.completedResearch = ['silicon_extraction'];
    ScenarioSystem.tick(state);
    expect(state.scenarioStatus).toBe('won');
    expect(state.scenarioScore).toBeGreaterThan(0);
  });

  it('tick transitions to lost when time runs out without completing objectives', () => {
    state.activeScenarioId = 'fast_start';
    state.scenarioStatus = 'active';
    state.tick = 72000;
    state.cash = 100;
    state.buildings = [];
    ScenarioSystem.tick(state);
    expect(state.scenarioStatus).toBe('lost');
  });

  it('tick does nothing when scenarioStatus is not active', () => {
    state.activeScenarioId = 'tutorial';
    state.scenarioStatus = 'won';
    state.cash = 0;
    ScenarioSystem.tick(state);
    expect(state.scenarioStatus).toBe('won');
  });
});
