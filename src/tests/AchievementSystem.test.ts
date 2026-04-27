import { describe, it, expect, beforeEach } from 'vitest';
import { checkAchievements, hasAchievement } from '../systems/AchievementSystem';
import { createTestGameState, createTestBuilding } from './testHelpers';
import type { GameState } from '../game/GameState';

describe('AchievementSystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState({
      buildings: [],
      tradeHistory: [],
      unlockedAchievements: [],
    });
  });

  it('does not unlock achievements on a fresh empty state', () => {
    state.cash = 0;
    checkAchievements(state);
    expect(state.unlockedAchievements).toHaveLength(0);
  });

  it('unlocks first_building when the player has at least one building', () => {
    state.buildings.push(createTestBuilding('wood_harvester'));
    checkAchievements(state);
    expect(hasAchievement(state, 'first_building')).toBe(true);
  });

  it('unlocks power_up when a power plant is built', () => {
    state.buildings.push(createTestBuilding('power_plant'));
    checkAchievements(state);
    expect(hasAchievement(state, 'power_up')).toBe(true);
  });

  it('unlocks first_sale after the first trade', () => {
    state.tradeHistory.push({
      tick: 1,
      partnerId: 'industrial_corp',
      resourceId: 'wood',
      amount: 10,
      price: 5,
      totalValue: 50,
    });
    checkAchievements(state);
    expect(hasAchievement(state, 'first_sale')).toBe(true);
  });

  it('unlocks five_buildings when 5 buildings exist', () => {
    for (let i = 0; i < 5; i++) {
      state.buildings.push(createTestBuilding('wood_harvester'));
    }
    checkAchievements(state);
    expect(hasAchievement(state, 'five_buildings')).toBe(true);
  });

  it('does not unlock five_buildings with only 4 buildings', () => {
    for (let i = 0; i < 4; i++) {
      state.buildings.push(createTestBuilding('wood_harvester'));
    }
    checkAchievements(state);
    expect(hasAchievement(state, 'five_buildings')).toBe(false);
  });

  it('unlocks first_research when a technology is completed', () => {
    state.completedResearch.push('silicon_extraction');
    checkAchievements(state);
    expect(hasAchievement(state, 'first_research')).toBe(true);
  });

  it('unlocks cash_1k when cash >= 1000', () => {
    state.cash = 1000;
    checkAchievements(state);
    expect(hasAchievement(state, 'cash_1k')).toBe(true);
  });

  it('does not unlock cash_1k with cash < 1000', () => {
    state.cash = 999;
    checkAchievements(state);
    expect(hasAchievement(state, 'cash_1k')).toBe(false);
  });

  it('unlocks cash_10k when cash >= 10000', () => {
    state.cash = 10000;
    checkAchievements(state);
    expect(hasAchievement(state, 'cash_10k')).toBe(true);
  });

  it('unlocks polluter when pollution >= 50', () => {
    state.pollution = 50;
    checkAchievements(state);
    expect(hasAchievement(state, 'polluter')).toBe(true);
  });

  it('does not re-fire alerts for already-unlocked achievements', () => {
    state.cash = 0; // prevent cash achievements from firing
    state.unlockedAchievements.push('first_building');
    state.buildings.push(createTestBuilding('wood_harvester'));
    const alertsBefore = state.alerts.length;
    checkAchievements(state);
    // Should not add a new alert for first_building since it's already unlocked
    expect(state.alerts.length).toBe(alertsBefore);
  });

  it('fires an alert when a new achievement is unlocked', () => {
    state.buildings.push(createTestBuilding('wood_harvester'));
    const alertsBefore = state.alerts.length;
    checkAchievements(state);
    expect(state.alerts.length).toBeGreaterThan(alertsBefore);
    expect(state.alerts.some((a) => a.messageKey === 'alerts.achievement_unlocked')).toBe(true);
  });
});
