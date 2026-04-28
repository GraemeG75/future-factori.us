/** How often (in ticks) to attempt generating a new contract. */
export const CONTRACT_GENERATION_INTERVAL = 600;
/** Maximum number of simultaneously active contracts. */
export const MAX_ACTIVE_CONTRACTS = 5;
/** Contract duration in ticks. */
export const CONTRACT_DURATION_TICKS = 6000;
/** Reward multiplier relative to sell price * amount. */
export const REWARD_MULTIPLIER = 1.4;
/** Penalty as a fraction of the reward. */
export const PENALTY_FRACTION = 0.5;
/** Minimum amount to demand per contract. */
export const CONTRACT_MIN_AMOUNT = 10;
/** Maximum amount to demand per contract. */
export const CONTRACT_MAX_AMOUNT = 80;
