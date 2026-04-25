import { BUILDINGS_MAP } from '../data/buildings';
import { RECIPES, RECIPES_MAP } from '../data/recipes';
import type { Recipe } from '../data/recipes';
import type { BuildingInstance, GameState } from '../game/GameState';
import { addResource, getStorageCapacity } from './ResourceSystem';
import { getHarvestRate } from './BuildingSystem';

/** Base research points generated per research center per level per second. */
const BASE_RP_PER_SECOND = 1;

/** Maps harvester building type ids to the resource id they produce. */
const HARVESTER_RESOURCE_MAP: Record<string, string> = {
  wood_harvester: 'wood',
  coal_mine: 'coal',
  iron_mine: 'iron_ore',
  water_pump: 'water',
  silicon_extractor: 'silicon',
  uranium_extractor: 'uranium',
};

/**
 * Advances all factory production, harvester generation, and research point
 * accumulation by the given number of real seconds.
 */
export function tick(state: GameState, deltaSeconds: number): void {
  for (const building of state.buildings) {
    if (!building.isPowered) continue;

    const buildingType = BUILDINGS_MAP[building.typeId];
    if (!buildingType) continue;

    // --- Harvesters ---
    if (buildingType.category === 'harvester') {
      const resourceId = HARVESTER_RESOURCE_MAP[building.typeId];
      if (resourceId) {
        const rate = getHarvestRate(building); // units per tick at 20 tps
        const amount = rate * 20 * deltaSeconds; // rate(u/tick) × 20(ticks/s) × Δs = units produced
        addResource(state, resourceId, amount);
      }
      continue;
    }

    // --- Research centers ---
    if (buildingType.category === 'research') {
      state.researchPoints += BASE_RP_PER_SECOND * building.level * deltaSeconds;
      continue;
    }

    // --- Production buildings ---
    if (building.activeRecipeId) {
      const recipe = RECIPES_MAP[building.activeRecipeId];
      if (!recipe) continue;

      // Speed bonus from building level
      const speedMultiplier = Math.pow(buildingType.productionRateMultiplier, building.level - 1);
      const progressDelta = (deltaSeconds * speedMultiplier) / recipe.processingTimeSeconds;
      building.productionProgress += progressDelta;

      if (building.productionProgress >= 1) {
        building.productionProgress = 0;

        // Move outputs to outputBuffer
        for (const output of recipe.outputs) {
          building.outputBuffer[output.resourceId] =
            (building.outputBuffer[output.resourceId] ?? 0) + output.amount;
        }

        // Flush outputBuffer to global inventory where capacity allows
        flushOutputBuffer(state, building);

        // Attempt to start next production cycle
        tryLoadInputs(state, building, recipe);
      }
    }
  }
}

/**
 * Starts production of the given recipe on a building.
 * Loads the first batch of inputs from the global inventory into the inputBuffer.
 * Returns false if the recipe is incompatible, locked, or inputs are unavailable.
 */
export function startProduction(
  state: GameState,
  buildingId: string,
  recipeId: string,
): boolean {
  const building = state.buildings.find((b) => b.id === buildingId);
  if (!building) return false;

  const recipe = RECIPES_MAP[recipeId];
  if (!recipe) return false;
  if (recipe.buildingTypeId !== building.typeId) return false;
  if (recipe.unlockRequirement && !state.completedResearch.includes(recipe.unlockRequirement)) {
    return false;
  }

  if (!tryLoadInputs(state, building, recipe)) return false;

  building.activeRecipeId = recipeId;
  building.productionProgress = 0;
  return true;
}

/** Stops active production on the building and returns inputs to inventory. */
export function stopProduction(state: GameState, buildingId: string): void {
  const building = state.buildings.find((b) => b.id === buildingId);
  if (!building) return;

  // Return unconsumed inputs to inventory
  for (const [resourceId, amount] of Object.entries(building.inputBuffer)) {
    addResource(state, resourceId, amount);
  }
  building.inputBuffer = {};
  building.activeRecipeId = null;
  building.productionProgress = 0;
}

/** Returns all recipes that a building can use, factoring in research state. */
export function getAvailableRecipes(state: GameState, buildingId: string): Recipe[] {
  const building = state.buildings.find((b) => b.id === buildingId);
  if (!building) return [];

  return RECIPES.filter((r) => {
    if (r.buildingTypeId !== building.typeId) return false;
    if (r.unlockRequirement && !state.completedResearch.includes(r.unlockRequirement)) {
      return false;
    }
    return true;
  });
}

/**
 * Returns the production rate for a building/recipe pair in outputs per minute.
 * Uses the first output resource for simplicity.
 */
export function getProductionRate(building: BuildingInstance, recipe: Recipe): number {
  const buildingType = BUILDINGS_MAP[building.typeId];
  if (!buildingType) return 0;
  const speedMultiplier = Math.pow(buildingType.productionRateMultiplier, building.level - 1);
  const cyclesPerMinute = (60 / recipe.processingTimeSeconds) * speedMultiplier;
  const firstOutput = recipe.outputs[0];
  return firstOutput ? cyclesPerMinute * firstOutput.amount : 0;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Attempts to load one cycle of recipe inputs from the global inventory into
 * the building's inputBuffer. Returns true if all inputs were loaded.
 */
function tryLoadInputs(state: GameState, building: BuildingInstance, recipe: Recipe): boolean {
  // Check that every input is available
  for (const input of recipe.inputs) {
    const available = (state.inventory[input.resourceId] ?? 0) +
      (building.inputBuffer[input.resourceId] ?? 0);
    if (available < input.amount) return false;
  }

  // Deduct from inventory (inputBuffer may already hold some from a previous partial load)
  for (const input of recipe.inputs) {
    const buffered = building.inputBuffer[input.resourceId] ?? 0;
    const needed = Math.max(0, input.amount - buffered);
    if (needed > 0) {
      state.inventory[input.resourceId] = (state.inventory[input.resourceId] ?? 0) - needed;
      building.inputBuffer[input.resourceId] = input.amount;
    }
  }
  return true;
}

/**
 * Moves resources from a building's outputBuffer into the global inventory,
 * respecting storage capacity limits.
 */
function flushOutputBuffer(state: GameState, building: BuildingInstance): void {
  for (const resourceId of Object.keys(building.outputBuffer)) {
    const amount = building.outputBuffer[resourceId] ?? 0;
    if (amount <= 0) continue;
    const capacity = getStorageCapacity(state, resourceId);
    const current = state.inventory[resourceId] ?? 0;
    const canStore = Math.max(0, capacity - current);
    const stored = Math.min(amount, canStore);
    state.inventory[resourceId] = current + stored;
    building.outputBuffer[resourceId] = amount - stored;
  }
}
