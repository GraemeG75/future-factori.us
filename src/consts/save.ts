export const SAVE_VERSION = 5;
export const SAVE_KEY = 'future_factorius_save';
/** Starting cash for a fresh game. */
export const STARTING_CASH = 2500;

/** Harvester type -> number of spots to generate in the world. */
export const HARVESTER_SPOT_COUNTS: Record<string, number> = {
  wood_harvester: 6,
  coal_mine: 4,
  iron_mine: 4,
  water_pump: 3
};

/** Minimum world-unit separation between any two spots. */
export const SPOT_MIN_SEPARATION = 12;

/** World dimensions must match what World.ts passes to createTerrain. */
export const TERRAIN_WIDTH = 500;
export const TERRAIN_DEPTH = 500;

/** Minimum height a spot must have to be considered "on land" (sea plane sits at y ≈ -0.35). */
export const LAND_MIN_HEIGHT = 0.05;

/** Candidate area half-size used for world generation (matches playable terrain extents). */
export const SPOT_WORLD_HALF_EXTENT = 180;

/** Minimum deposit size (units) for any resource spot. */
export const DEPOSIT_MIN = 3000;
/** Maximum deposit size (units) for any resource spot. */
export const DEPOSIT_MAX = 15000;

export const SPOT_HEIGHT_OFFSET: Record<string, { min: number; max: number }> = {
  wood_harvester: { min: 0.35, max: 0.62 },
  coal_mine: { min: 0.06, max: 0.22 },
  iron_mine: { min: 0.18, max: 0.4 },
  water_pump: { min: -0.28, max: -0.12 },
  silicon_extractor: { min: 0.15, max: 0.36 },
  uranium_extractor: { min: 0.24, max: 0.5 }
};
