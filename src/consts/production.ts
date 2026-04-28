/** Base research points generated per research center per level per second. */
export const BASE_RP_PER_SECOND = 1;

/** Pollution (0–100) added to the global level per production-building second of operation. */
export const POLLUTION_PER_BUILDING_SECOND = 0.002;

/** Pollution decay rate per second (natural environmental recovery). */
export const POLLUTION_DECAY_PER_SECOND = 0.001;

/** Fraction of remaining/maxRemaining below which a low-deposit alert fires. */
export const LOW_DEPOSIT_THRESHOLD = 0.1;

/** Minimum ticks between repeat low-deposit alerts for the same spot. */
export const DEPOSIT_ALERT_COOLDOWN_TICKS = 600;

/** Maps harvester building type ids to the resource id they produce. */
export const HARVESTER_RESOURCE_MAP: Record<string, string> = {
  wood_harvester: 'wood',
  coal_mine: 'coal',
  iron_mine: 'iron_ore',
  water_pump: 'water',
  silicon_extractor: 'silicon',
  uranium_extractor: 'uranium'
};
