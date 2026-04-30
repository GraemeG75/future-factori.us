import type { BuildingInstance, GameState } from '../game/GameState';
import {
  HOT_BUILDING_IDS,
  COOLING_BUILDING_IDS,
  HEAT_GENERATION_PER_TICK,
  HEAT_NATURAL_DECAY_PER_TICK,
  HEAT_PENALTY_THRESHOLD
} from '../consts/heat';

export { HOT_BUILDING_IDS };

/**
 * Returns an efficiency penalty multiplier in [0, 0.5] for a building's heat.
 * Returns 0 below the threshold, linearly scales to 0.5 at heat = 100.
 */
export function getHeatPenalty(heat: number): number {
  if (heat <= HEAT_PENALTY_THRESHOLD) {
    return 0;
  }
  return ((heat - HEAT_PENALTY_THRESHOLD) / (100 - HEAT_PENALTY_THRESHOLD)) * 0.5;
}

/** Squared distance between two XZ positions. */
function distSq(a: { x: number; z: number }, b: { x: number; z: number }): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

/**
 * Dissipates heat each tick:
 * - Natural decay for every building.
 * - Cooling buildings reduce heat of all buildings within their range.
 */
function dissipateHeat(state: GameState): void {
  for (const building of state.buildings) {
    if (building.heat <= 0) {
      continue;
    }

    building.heat = Math.max(0, building.heat - HEAT_NATURAL_DECAY_PER_TICK);

    for (const cooler of state.buildings) {
      const cfg = COOLING_BUILDING_IDS[cooler.typeId];
      if (!cfg || !cooler.isPowered) {
        continue;
      }
      const rangeSq = cfg.range * cfg.range;
      if (distSq(building.position, cooler.position) <= rangeSq) {
        building.heat = Math.max(0, building.heat - cfg.coolingPerTick);
      }
    }

    building.heat = Math.min(100, building.heat);
  }
}

/**
 * Generates heat in powered hot buildings and updates globalHeat.
 * Called once per game tick.
 */
export function tick(state: GameState): void {
  dissipateHeat(state);

  // Generate heat in hot buildings
  for (const building of state.buildings) {
    if (!HOT_BUILDING_IDS.has(building.typeId)) {
      continue;
    }
    if (!building.isPowered) {
      continue;
    }
    building.heat = Math.min(100, building.heat + HEAT_GENERATION_PER_TICK);
  }

  // Compute globalHeat (average heat of hot buildings)
  const hotBuildings = state.buildings.filter((b) => HOT_BUILDING_IDS.has(b.typeId));
  if (hotBuildings.length === 0) {
    state.globalHeat = 0;
  } else {
    const total = hotBuildings.reduce((sum, b) => sum + b.heat, 0);
    state.globalHeat = total / hotBuildings.length;
  }

  // Track heat crisis
  if (state.globalHeat > 90) {
    state.heatCrisisTicks = (state.heatCrisisTicks ?? 0) + 1;
  } else {
    state.heatCrisisTicks = 0;
  }
}

/**
 * Returns the effective efficiency of a building after applying heat penalty.
 * Returns 1.0 if not a hot building or heat is within safe range.
 */
export function getHeatEfficiency(building: BuildingInstance): number {
  if (!HOT_BUILDING_IDS.has(building.typeId)) {
    return 1.0;
  }
  return 1.0 - getHeatPenalty(building.heat);
}
