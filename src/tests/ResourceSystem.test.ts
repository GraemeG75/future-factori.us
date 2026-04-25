import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAmount,
  addResource,
  removeResource,
  canAfford,
  isResourceUnlocked,
  getResourceValue,
} from '../systems/ResourceSystem';
import { createTestGameState } from './testHelpers';
import type { GameState } from '../game/GameState';

describe('ResourceSystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState({ inventory: {} });
  });

  it('getAmount returns 0 for unknown resources', () => {
    expect(getAmount(state, 'nonexistent')).toBe(0);
  });

  it('addResource increases amount', () => {
    addResource(state, 'wood', 50);
    expect(getAmount(state, 'wood')).toBe(50);
  });

  it('removeResource decreases amount and returns true', () => {
    addResource(state, 'wood', 100);
    const result = removeResource(state, 'wood', 30);
    expect(result).toBe(true);
    expect(getAmount(state, 'wood')).toBe(70);
  });

  it('removeResource returns false when insufficient', () => {
    addResource(state, 'wood', 10);
    const result = removeResource(state, 'wood', 50);
    expect(result).toBe(false);
    expect(getAmount(state, 'wood')).toBe(10);
  });

  it('canAfford returns true when sufficient resources', () => {
    addResource(state, 'wood', 20);
    addResource(state, 'coal', 10);
    expect(canAfford(state, { wood: 20, coal: 5 })).toBe(true);
  });

  it('canAfford returns false when insufficient', () => {
    addResource(state, 'wood', 5);
    expect(canAfford(state, { wood: 10 })).toBe(false);
  });

  it('isResourceUnlocked returns true for basic resources (no unlock requirement)', () => {
    expect(isResourceUnlocked([], 'wood')).toBe(true);
    expect(isResourceUnlocked([], 'coal')).toBe(true);
    expect(isResourceUnlocked([], 'iron_ore')).toBe(true);
  });

  it('isResourceUnlocked returns false for locked resources', () => {
    expect(isResourceUnlocked([], 'silicon')).toBe(false);
    expect(isResourceUnlocked([], 'uranium')).toBe(false);
  });

  it('isResourceUnlocked returns true after research is completed', () => {
    expect(isResourceUnlocked(['silicon_extraction'], 'silicon')).toBe(true);
  });

  it('getResourceValue returns basePrice * amount', () => {
    // wood basePrice = 5
    expect(getResourceValue('wood', 10)).toBe(50);
    // coal basePrice = 8
    expect(getResourceValue('coal', 4)).toBe(32);
  });
});
