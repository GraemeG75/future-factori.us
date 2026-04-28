/** Game ticks per real second. */
export const TICK_RATE = 20;
/** Seconds per game tick. */
export const TICK_INTERVAL = 1 / TICK_RATE;
/** Number of ticks between autosaves (~1 minute at 20 tps). */
export const AUTOSAVE_TICKS = 1200;
/** Demand is updated every this many ticks (1 game second). */
export const MAINTENANCE_INTERVAL = 20;
/** Maximum number of historical price entries kept per resource per partner. */
export const PRICE_HISTORY_LENGTH = 20;
/** How often (in ticks) price history is sampled. */
export const PRICE_SAMPLE_INTERVAL = 600;
/** Shadow map depth bias. */
export const SHADOW_BIAS = -0.00015;
/** Shadow map normal bias. */
export const SHADOW_NORMAL_BIAS = 0.025;
