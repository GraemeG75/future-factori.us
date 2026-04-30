import { RESOURCES_MAP } from '../data/resources';
import { BUILDINGS_MAP } from '../data/buildings';
import type { GameState } from '../game/GameState';
import { STORAGE_DEPOT_CAPACITY_PER_LEVEL } from '../consts/buildings';

/**
 * Returns the current amount of a resource in the global inventory.
 */
export function getAmount(state: GameState, resourceId: string): number {
  return state.inventory[resourceId] ?? 0;
}

/**
 * Adds the given amount of a resource to the global inventory,
 * capped at storage capacity.
 */
export function addResource(state: GameState, resourceId: string, amount: number): void {
  const capacity = getStorageCapacity(state, resourceId);
  const current = getAmount(state, resourceId);
  state.inventory[resourceId] = Math.min(current + amount, capacity);
}

/**
 * Removes the given amount from the global inventory.
 * Returns false and makes no change if there is not enough.
 */
export function removeResource(state: GameState, resourceId: string, amount: number): boolean {
  const current = getAmount(state, resourceId);
  if (current < amount) {
    return false;
  }
  state.inventory[resourceId] = current - amount;
  return true;
}

/**
 * Returns true if the global inventory contains at least every cost entry.
 */
export function canAfford(state: GameState, costs: Record<string, number>): boolean {
  return Object.entries(costs).every(([id, amount]) => getAmount(state, id) >= amount);
}

/**
 * Returns the maximum storage capacity for a resource, factoring in
 * all storage_depot buildings and their levels.
 */
export function getStorageCapacity(state: GameState, resourceId: string): number {
  const resource = RESOURCES_MAP[resourceId];
  if (!resource) {
    return 0;
  }
  const baseCapacity = resource.storageSize * 10;
  const storageBonus = state.buildings
    .filter((b) => b.typeId === 'storage_depot')
    .reduce((sum, b) => sum + b.level * STORAGE_DEPOT_CAPACITY_PER_LEVEL, 0);
  return baseCapacity + storageBonus;
}

/**
 * Returns true if a resource is available given the set of completed research.
 * Resources without an unlockRequirement are always available.
 */
export function isResourceUnlocked(completedResearch: string[], resourceId: string): boolean {
  const resource = RESOURCES_MAP[resourceId];
  if (!resource) {
    return false;
  }
  if (!resource.unlockRequirement) {
    return true;
  }
  return completedResearch.includes(resource.unlockRequirement);
}

/**
 * Returns the total market value of a quantity of a resource at base price.
 */
export function getResourceValue(resourceId: string, quantity: number): number {
  const resource = RESOURCES_MAP[resourceId];
  if (!resource) {
    return 0;
  }
  return resource.basePrice * quantity;
}

/**
 * Returns true if a building type is unlocked given completed research.
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
