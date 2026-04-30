import { BUILDINGS_MAP } from '../data/buildings';
import type { BuildingInstance, GameState, ResourceSpot } from '../game/GameState';
import { sampleTerrainHeight } from '../game/TerrainGeneration';
import { BASE_HARVEST_RATE, HARVESTER_SNAP_RADIUS, MIN_BUILDING_SEPARATION, TERRAIN_HEIGHT_PRECISION } from '../consts/buildings';

function getTerrainAnchoredPosition(state: GameState, position: { x: number; y: number; z: number }) {
  return {
    x: position.x,
    y: Math.round(sampleTerrainHeight(state.worldSeed, position.x, position.z) * TERRAIN_HEIGHT_PRECISION) / TERRAIN_HEIGHT_PRECISION,
    z: position.z
  };
}

/**
 * Attempts to place a building of the given type at the specified position.
 * Deducts the cost from cash. Returns the new BuildingInstance, or null if
 * the player cannot afford it or the type is locked.
 */
export function placeBuilding(state: GameState, typeId: string, clickPosition: { x: number; y: number; z: number }): BuildingInstance | null {
  const buildingType = BUILDINGS_MAP[typeId];
  if (!buildingType) {
    return null;
  }
  if (!isBuildingTypeUnlocked(state.completedResearch, typeId)) {
    return null;
  }
  if (state.cash < buildingType.baseCost) {
    return null;
  }

  // Harvesters must snap to a matching unoccupied resource spot
  let buildPosition = clickPosition;
  let targetSpot: ResourceSpot | undefined;
  if (buildingType.category === 'harvester') {
    targetSpot = findNearestUnoccupiedSpot(state, typeId, clickPosition);
    if (!targetSpot) {
      return null;
    }
    buildPosition = targetSpot.position;
  } else {
    buildPosition = getTerrainAnchoredPosition(state, clickPosition);
    // Collision detection: reject placement if too close to any existing building.
    const tooClose = state.buildings.some((b) => {
      const dx = b.position.x - clickPosition.x;
      const dz = b.position.z - clickPosition.z;
      return Math.sqrt(dx * dx + dz * dz) < MIN_BUILDING_SEPARATION;
    });
    if (tooClose) {
      return null;
    }
  }

  state.cash -= buildingType.baseCost;

  const building: BuildingInstance = {
    id: crypto.randomUUID(),
    typeId,
    level: 1,
    position: buildPosition,
    rotation: 0,
    health: 100,
    activeRecipeId: null,
    productionProgress: 0,
    inputBuffer: {},
    outputBuffer: {},
    isPowered: true,
    assignedRouteIds: [],
    heat: 0
  };

  state.buildings.push(building);

  if (targetSpot) {
    targetSpot.occupiedByBuildingId = building.id;
  }

  return building;
}

/**
 * Upgrades a building's level by 1. Deducts the upgrade cost from cash.
 * Returns false if the building is at max level or the player cannot afford it.
 */
export function upgradeBuilding(state: GameState, buildingId: string): boolean {
  const building = getBuildingById(state, buildingId);
  if (!building) {
    return false;
  }

  const buildingType = BUILDINGS_MAP[building.typeId];
  if (!buildingType) {
    return false;
  }
  if (building.level >= buildingType.maxLevel) {
    return false;
  }

  const cost = buildingType.baseCost * Math.pow(buildingType.upgradeCostMultiplier, building.level);
  if (state.cash < cost) {
    return false;
  }

  state.cash -= cost;
  building.level += 1;
  return true;
}

/**
 * Removes a building from the game, disconnecting any assigned routes.
 */
export function removeBuilding(state: GameState, buildingId: string): void {
  state.buildings = state.buildings.filter((b) => b.id !== buildingId);
  state.routes = state.routes.filter((r) => r.fromBuildingId !== buildingId && r.toBuildingId !== buildingId);
  // Free any resource spot this building was occupying
  const spot = state.resourceSpots.find((s) => s.occupiedByBuildingId === buildingId);
  if (spot) {
    spot.occupiedByBuildingId = null;
  }
}

/** Returns a BuildingInstance by its unique id, or undefined if not found. */
export function getBuildingById(state: GameState, id: string): BuildingInstance | undefined {
  return state.buildings.find((b) => b.id === id);
}

/** Returns all buildings of the given typeId. */
export function getBuildingsByType(state: GameState, typeId: string): BuildingInstance[] {
  return state.buildings.filter((b) => b.typeId === typeId);
}

/**
 * Returns the total maintenance cost per game tick across all buildings.
 */
export function getBuildingMaintenance(state: GameState): number {
  return state.buildings.reduce((sum, b) => {
    const bt = BUILDINGS_MAP[b.typeId];
    return sum + (bt ? bt.baseMaintenanceCostPerTick : 0);
  }, 0);
}

/**
 * Returns true if a building type is available to build given the player's research.
 */
export function isBuildingTypeUnlocked(completedResearch: string[], typeId: string): boolean {
  const buildingType = BUILDINGS_MAP[typeId];
  if (!buildingType) {
    return false;
  }
  if (!buildingType.unlockRequirement) {
    return true;
  }
  return completedResearch.includes(buildingType.unlockRequirement);
}

/**
 * Returns the harvest rate in units per tick for a harvester building,
 * scaled by level and the type's productionRateMultiplier.
 */
export function getHarvestRate(building: BuildingInstance): number {
  const buildingType = BUILDINGS_MAP[building.typeId];
  if (!buildingType || buildingType.category !== 'harvester') {
    return 0;
  }
  return BASE_HARVEST_RATE * building.level * Math.pow(buildingType.productionRateMultiplier, building.level - 1);
}

/**
 * Returns total power production (positive) from all power-producing buildings.
 * Power-producing buildings have a negative basePowerUsage.
 */
export function getPowerProduction(state: GameState): number {
  return state.buildings.reduce((sum, b) => {
    const bt = BUILDINGS_MAP[b.typeId];
    if (!bt || bt.basePowerUsage >= 0) {
      return sum;
    }
    return sum + Math.abs(bt.basePowerUsage) * b.level;
  }, 0);
}

/**
 * Returns total power consumption across all buildings that consume power.
 */
export function getPowerConsumption(state: GameState): number {
  return state.buildings.reduce((sum, b) => {
    const bt = BUILDINGS_MAP[b.typeId];
    if (!bt || bt.basePowerUsage <= 0) {
      return sum;
    }
    return sum + bt.basePowerUsage * b.level;
  }, 0);
}

/**
 * Returns the supply chain efficiency of a building as a 0–1 value.
 * Factors in power status, health, and whether a recipe is running.
 */
export function getBuildingEfficiency(building: BuildingInstance): number {
  if (!building.isPowered) {
    return 0;
  }
  if (building.health <= 0) {
    return 0;
  }
  const bt = BUILDINGS_MAP[building.typeId];
  if (!bt) {
    return 0;
  }
  // Research and storage buildings are always considered efficient when powered
  if (bt.category === 'research' || bt.category === 'storage' || bt.category === 'trade' || bt.category === 'power') {
    return building.health / 100;
  }
  // Factories and harvesters need a recipe/resource to be productive
  if (bt.category === 'harvester') {
    return building.health / 100;
  }
  // Factories need an active recipe
  if (!building.activeRecipeId) {
    return 0;
  }
  return building.health / 100;
}

/**
 * Updates the isPowered flag on all buildings based on total grid balance.
 * If production >= consumption every building is powered; otherwise buildings
 * are powered in order until capacity runs out.
 */
export function updatePowerState(state: GameState): void {
  const production = getPowerProduction(state);
  let remaining = production;

  for (const building of state.buildings) {
    const bt = BUILDINGS_MAP[building.typeId];
    const usage = bt && bt.basePowerUsage > 0 ? bt.basePowerUsage * building.level : 0;
    if (usage === 0) {
      building.isPowered = true;
    } else if (remaining >= usage) {
      building.isPowered = true;
      remaining -= usage;
    } else {
      building.isPowered = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns the nearest unoccupied resource spot of the given type within
 * HARVESTER_SNAP_RADIUS world units of the click position, or undefined if none.
 */
function findNearestUnoccupiedSpot(state: GameState, typeId: string, position: { x: number; y: number; z: number }): ResourceSpot | undefined {
  let best: ResourceSpot | undefined;
  let bestDist = HARVESTER_SNAP_RADIUS;

  for (const spot of state.resourceSpots) {
    if (spot.buildingTypeId !== typeId) {
      continue;
    }
    if (spot.occupiedByBuildingId !== null) {
      continue;
    }
    const dx = spot.position.x - position.x;
    const dz = spot.position.z - position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < bestDist) {
      bestDist = dist;
      best = spot;
    }
  }

  return best;
}
