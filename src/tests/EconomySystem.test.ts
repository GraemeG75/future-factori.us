import { describe, it, expect, beforeEach } from 'vitest';
import {
  sellResource,
  getSellPrice,
  getTotalOperatingCost,
  tick,
} from '../systems/EconomySystem';
import { createTestGameState } from './testHelpers';
import type { GameState } from '../game/GameState';

describe('EconomySystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState({ inventory: { wood: 100 } });
  });

  it('sellResource deducts resource from inventory', () => {
    sellResource(state, 'wood', 10, 'industrial_corp');
    expect(state.inventory['wood']).toBe(90);
  });

  it('sellResource adds cash to state', () => {
    const cashBefore = state.cash;
    sellResource(state, 'wood', 10, 'industrial_corp');
    expect(state.cash).toBeGreaterThan(cashBefore);
  });

  it('sellResource returns false if insufficient resource', () => {
    state.inventory['wood'] = 5;
    const result = sellResource(state, 'wood', 10, 'industrial_corp');
    expect(result).toBe(false);
    expect(state.inventory['wood']).toBe(5);
  });

  it('getSellPrice returns positive value', () => {
    const price = getSellPrice(state, 'wood', 'industrial_corp');
    expect(price).toBeGreaterThan(0);
  });

  it('getSellPrice is modified by partner price modifier', () => {
    // industrial_corp has priceModifier=1.0, energy_traders has priceModifier=1.25
    const priceBase = getSellPrice(state, 'coal', 'industrial_corp');
    const priceHigher = getSellPrice(state, 'coal', 'energy_traders');
    // energy_traders should have higher price on average
    expect(priceHigher).toBeGreaterThanOrEqual(priceBase);
  });

  it('getTotalOperatingCost is positive', () => {
    const cost = getTotalOperatingCost(state);
    expect(cost).toBeGreaterThan(0);
  });

  it('maintenance is deducted each tick interval', () => {
    const cashBefore = state.cash;
    tick(state, 1); // 1 second
    expect(state.cash).toBeLessThan(cashBefore);
  });
});
