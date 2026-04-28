/** Building type ids that generate heat during production. */
export const HOT_BUILDING_IDS = new Set(['quantum_forge', 'fusion_plant', 'bio_reactor', 'singularity_tap', 'mind_matrix', 'reality_forge']);

/** Building type ids that actively cool nearby buildings. */
export const COOLING_BUILDING_IDS: Record<string, { range: number; coolingPerTick: number }> = {
  radiator: { range: 15, coolingPerTick: 5 },
  cooling_tower: { range: 30, coolingPerTick: 12 }
};

/** Heat generated per tick by a hot building that is actively powered. */
export const HEAT_GENERATION_PER_TICK = 0.8;

/** Natural heat decay per tick for every building. */
export const HEAT_NATURAL_DECAY_PER_TICK = 2;

/** Heat threshold above which efficiency penalty begins. */
export const HEAT_PENALTY_THRESHOLD = 80;
