import { ACHIEVEMENTS } from '../data/achievements';
import type { GameState } from '../game/GameState';

/**
 * Checks all achievement conditions against the current game state and
 * unlocks any that are newly satisfied. Fires an in-game alert for each
 * newly unlocked achievement.
 */
export function checkAchievements(state: GameState): void {
  for (const achievement of ACHIEVEMENTS) {
    if (state.unlockedAchievements.includes(achievement.id)) continue;
    if (isUnlocked(achievement.id, state)) {
      state.unlockedAchievements.push(achievement.id);
      state.alerts.push({
        id: crypto.randomUUID(),
        tick: state.tick,
        type: 'success',
        messageKey: 'alerts.achievement_unlocked',
        params: [achievement.nameKey, achievement.icon],
      });
    }
  }
}

/** Returns true if a specific achievement is unlocked. */
export function hasAchievement(state: GameState, id: string): boolean {
  return state.unlockedAchievements.includes(id);
}

// ---------------------------------------------------------------------------
// Condition evaluators
// ---------------------------------------------------------------------------

function isUnlocked(id: string, state: GameState): boolean {
  switch (id) {
    case 'first_building':
      return state.buildings.length >= 1;

    case 'power_up':
      return state.buildings.some((b) => b.typeId === 'power_plant');

    case 'first_sale':
      return state.tradeHistory.length >= 1;

    case 'five_buildings':
      return state.buildings.length >= 5;

    case 'ten_buildings':
      return state.buildings.length >= 10;

    case 'first_research':
      return state.completedResearch.length >= 1;

    case 'cash_1k':
      return state.cash >= 1_000;

    case 'cash_10k':
      return state.cash >= 10_000;

    case 'cash_100k':
      return state.cash >= 100_000;

    case 'five_routes':
      return state.routes.length >= 5;

    case 'repair_crew':
      // Checked externally via explicit flag — only set by repairBuilding callsite.
      return state.unlockedAchievements.includes('repair_crew');

    case 'polluter':
      return state.pollution >= 50;

    case 'clean_factory':
      return state.buildings.length >= 5 && state.pollution < 20;

    case 'deposit_depleted':
      return state.resourceSpots.some((s) => s.remaining <= 0 && s.occupiedByBuildingId !== null);

    default:
      return false;
  }
}
