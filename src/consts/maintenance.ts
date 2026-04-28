/** Health drained per second while a building is operating. */
export const HEALTH_DRAIN_PER_SECOND = 0.05;

/** Probability per second that a random breakdown event occurs. */
export const BREAKDOWN_CHANCE_PER_SECOND = 0.0004;

/** Health lost during a breakdown event (percentage points). */
export const BREAKDOWN_DAMAGE = 40;

/** Minimum health below which a building goes offline (broken). */
export const BROKEN_HEALTH_THRESHOLD = 0;

/** Fraction of base building cost charged per 1% of missing health repaired. */
export const REPAIR_COST_MULTIPLIER = 0.4;

/** Minimum efficiency factor applied at 0% health (buildings below broken threshold are offline). */
export const MIN_EFFICIENCY = 0.5;
/** Efficiency scale factor: health 0→100 maps efficiency MIN_EFFICIENCY→1.0. */
export const EFFICIENCY_SCALE = 1 - MIN_EFFICIENCY;
