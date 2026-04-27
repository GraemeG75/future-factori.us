import { describe, it, expect, beforeEach } from 'vitest';
import { tick, repairBuilding, getRepairCost, getHealthEfficiency } from '../systems/MaintenanceSystem';
import { createTestGameState, createTestBuilding } from './testHelpers';
import type { GameState } from '../game/GameState';

describe('MaintenanceSystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState();
    // Ensure buildings are powered and healthy
    for (const b of state.buildings) {
      b.isPowered = true;
      b.health = 100;
    }
  });

  it('drains health from powered operating buildings', () => {
    const building = state.buildings[0]!;
    building.isPowered = true;
    building.health = 100;

    tick(state, 100); // 100 seconds of operation

    expect(building.health).toBeLessThan(100);
    expect(building.health).toBeGreaterThan(0);
  });

  it('does not drain health from unpowered buildings', () => {
    const building = state.buildings[0]!;
    building.isPowered = false;
    building.health = 100;

    tick(state, 1000);

    expect(building.health).toBe(100);
  });

  it('does not drain health below 0', () => {
    const building = state.buildings[0]!;
    building.isPowered = true;
    building.health = 0.01;

    tick(state, 1000);

    expect(building.health).toBeGreaterThanOrEqual(0);
  });

  it('getRepairCost returns 0 for a fully healthy building', () => {
    const building = state.buildings[0]!;
    building.health = 100;
    expect(getRepairCost(building)).toBe(0);
  });

  it('getRepairCost returns a positive value for a damaged building', () => {
    const building = state.buildings[0]!;
    building.health = 50;
    expect(getRepairCost(building)).toBeGreaterThan(0);
  });

  it('repairBuilding restores health to 100', () => {
    const building = state.buildings[0]!;
    building.health = 30;
    state.cash = 100000;

    const ok = repairBuilding(state, building.id);

    expect(ok).toBe(true);
    expect(building.health).toBe(100);
  });

  it('repairBuilding deducts cash', () => {
    const building = state.buildings[0]!;
    building.health = 30;
    const cashBefore = state.cash;

    repairBuilding(state, building.id);

    expect(state.cash).toBeLessThan(cashBefore);
  });

  it('repairBuilding returns false when already at full health', () => {
    const building = state.buildings[0]!;
    building.health = 100;

    const ok = repairBuilding(state, building.id);

    expect(ok).toBe(false);
  });

  it('repairBuilding returns false when insufficient cash', () => {
    const building = state.buildings[0]!;
    building.health = 0;
    state.cash = 0;

    const ok = repairBuilding(state, building.id);

    expect(ok).toBe(false);
    expect(building.health).toBe(0);
  });

  it('getHealthEfficiency returns 0 for a broken building (health=0)', () => {
    const building = createTestBuilding('basic_factory', { health: 0 });
    expect(getHealthEfficiency(building)).toBe(0);
  });

  it('getHealthEfficiency returns 1.0 for a full health building', () => {
    const building = createTestBuilding('basic_factory', { health: 100 });
    expect(getHealthEfficiency(building)).toBe(1.0);
  });

  it('getHealthEfficiency returns a value between 0.5 and 1.0 for partial health', () => {
    const building = createTestBuilding('basic_factory', { health: 50 });
    const eff = getHealthEfficiency(building);
    expect(eff).toBeGreaterThan(0.5);
    expect(eff).toBeLessThan(1.0);
  });
});
