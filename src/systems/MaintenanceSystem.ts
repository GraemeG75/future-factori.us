import { BUILDINGS_MAP } from '../data/buildings';
import type { BuildingInstance, GameState } from '../game/GameState';
import {
  HEALTH_DRAIN_PER_SECOND,
  BREAKDOWN_CHANCE_PER_SECOND,
  BREAKDOWN_DAMAGE,
  BROKEN_HEALTH_THRESHOLD,
  REPAIR_COST_MULTIPLIER,
  MIN_EFFICIENCY,
  EFFICIENCY_SCALE
} from '../consts/maintenance';

export { BROKEN_HEALTH_THRESHOLD };

/**
 * Advances building health: drains health from powered, operating buildings,
 * and randomly triggers breakdown events.
 */
export function tick(state: GameState, deltaSeconds: number): void {
  for (const building of state.buildings) {
    if (!building.isPowered) continue;
    if (building.health <= BROKEN_HEALTH_THRESHOLD) continue;

    // Gradual wear
    building.health = Math.max(BROKEN_HEALTH_THRESHOLD, building.health - HEALTH_DRAIN_PER_SECOND * deltaSeconds);

    // Random breakdown event
    if (Math.random() < BREAKDOWN_CHANCE_PER_SECOND * deltaSeconds) {
      const newHealth = Math.max(BROKEN_HEALTH_THRESHOLD, building.health - BREAKDOWN_DAMAGE);
      building.health = newHealth;

      const bt = BUILDINGS_MAP[building.typeId];
      state.alerts.push({
        id: crypto.randomUUID(),
        tick: state.tick,
        type: 'warning',
        messageKey: 'alerts.building_breakdown',
        params: [bt ? bt.nameKey : building.typeId]
      });
    }
  }
}

/**
 * Returns the repair cost for a building based on how much health it needs
 * to restore. Returns 0 if already at full health.
 */
export function getRepairCost(building: BuildingInstance): number {
  const bt = BUILDINGS_MAP[building.typeId];
  if (!bt) return 0;
  const missingHealth = 100 - building.health;
  if (missingHealth <= 0) return 0;
  return Math.ceil(bt.baseCost * REPAIR_COST_MULTIPLIER * (missingHealth / 100));
}

/**
 * Repairs a building, restoring health to 100. Deducts the repair cost from
 * cash. Returns false if the player cannot afford the repair or the building
 * is already at full health.
 */
export function repairBuilding(state: GameState, buildingId: string): boolean {
  const building = state.buildings.find((b) => b.id === buildingId);
  if (!building) return false;
  if (building.health >= 100) return false;

  const cost = getRepairCost(building);
  if (state.cash < cost) return false;

  state.cash -= cost;
  building.health = 100;
  return true;
}

/**
 * Returns an efficiency multiplier (0–1) based on building health.
 * Full health → 1.0; broken (health = 0) → 0.0 (building offline).
 */
export function getHealthEfficiency(building: BuildingInstance): number {
  if (building.health <= BROKEN_HEALTH_THRESHOLD) return 0;
  // Scale from MIN_EFFICIENCY at health=1 to 1.0 at health=100 for a meaningful
  // efficiency curve (a damaged building still works, just slower).
  return MIN_EFFICIENCY + (building.health / 100) * EFFICIENCY_SCALE;
}
