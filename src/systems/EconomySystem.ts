import { RESOURCES_MAP } from '../data/resources';
import { TRADE_PARTNERS_MAP } from '../data/tradePartners';
import type { GameState } from '../game/GameState';
import { getEventPriceModifier } from './EventSystem';
import { TICK_RATE, AUTOSAVE_TICKS, MAINTENANCE_INTERVAL, PRICE_HISTORY_LENGTH, PRICE_SAMPLE_INTERVAL } from '../consts/simulation';
import { DEMAND_DRIFT, DEMAND_MIN, DEMAND_MAX } from '../consts/economy';

export { TICK_RATE, AUTOSAVE_TICKS, MAINTENANCE_INTERVAL, PRICE_HISTORY_LENGTH };

/**
 * Economy tick: applies demand fluctuation, samples price history.
 */
export function tick(state: GameState, _deltaSeconds: number): void {
  // Fluctuate demand roughly every MAINTENANCE_INTERVAL ticks
  if (state.tick % MAINTENANCE_INTERVAL === 0) {
    updateDemand(state);
  }
  // Sample price history periodically
  if (state.tick % PRICE_SAMPLE_INTERVAL === 0) {
    samplePriceHistory(state);
  }
}

/**
 * Sells a quantity of a resource to a trade partner.
 * Removes the resource from inventory, credits cash, and records the trade.
 * Returns false if the player does not have enough of the resource or the
 * partner / resource is not valid.
 */
export function sellResource(state: GameState, resourceId: string, amount: number, partnerId: string): boolean {
  const current = state.inventory[resourceId] ?? 0;
  if (current < amount) {
    return false;
  }

  const partner = TRADE_PARTNERS_MAP[partnerId];
  if (!partner) {
    return false;
  }
  if (partner.unlockRequirement && !state.completedResearch.includes(partner.unlockRequirement)) {
    return false;
  }

  const price = getSellPrice(state, resourceId, partnerId);
  const totalValue = price * amount;

  state.inventory[resourceId] = current - amount;
  state.cash += totalValue;

  state.tradeHistory.push({
    tick: state.tick,
    partnerId,
    resourceId,
    amount,
    price,
    totalValue
  });

  return true;
}

/**
 * Returns the effective sell price for a resource with a given partner,
 * factoring in the partner's price modifier, current demand, pollution, and
 * any active market events.
 */
export function getSellPrice(state: GameState, resourceId: string, partnerId: string): number {
  const resource = RESOURCES_MAP[resourceId];
  const partner = TRADE_PARTNERS_MAP[partnerId];
  if (!resource || !partner) {
    return 0;
  }

  const demand = getTradePartnerDemand(state, partnerId, resourceId);
  // Pollution suppresses prices: at pollution=100 prices are halved.
  const pollutionFactor = 1 - (state.pollution / 100) * 0.5;
  // Active market events can boost or reduce prices.
  const eventModifier = getEventPriceModifier(state, resourceId, partnerId);
  // Demand in [0.1, 1.0] maps price to [0.6 × base, 1.5 × base]
  return Math.floor(resource.basePrice * partner.priceModifier * (0.5 + demand) * pollutionFactor * eventModifier);
}

/**
 * Returns the total operating cost per game tick.
 * Passive operating costs are currently disabled.
 */
export function getTotalOperatingCost(_state: GameState): number {
  return 0;
}

/**
 * Returns the profit generated in the previous game tick:
 * trade revenue recorded at tick-1 minus operating cost per tick.
 */
export function getProfitSinceLastTick(state: GameState): number {
  const lastTick = state.tick - 1;
  const revenue = state.tradeHistory.filter((r) => r.tick === lastTick).reduce((sum, r) => sum + r.totalValue, 0);
  return revenue - getTotalOperatingCost(state);
}

/**
 * Applies small random fluctuations to all trade partner demand values.
 */
export function updateDemand(state: GameState): void {
  for (const [partnerId, partnerDemand] of Object.entries(state.demand)) {
    for (const resourceId of Object.keys(partnerDemand)) {
      const current = partnerDemand[resourceId] ?? 0;
      const delta = (Math.random() * 2 - 1) * DEMAND_DRIFT;
      state.demand[partnerId][resourceId] = Math.max(DEMAND_MIN, Math.min(DEMAND_MAX, current + delta));
    }
  }
}

/**
 * Returns the current demand level (0-1) for a resource from a trade partner.
 * Falls back to the partner's baseDemand (preferred resources get +0.2 bonus).
 */
export function getTradePartnerDemand(state: GameState, partnerId: string, resourceId: string): number {
  const storedDemand = state.demand[partnerId]?.[resourceId];
  if (storedDemand !== undefined) {
    return storedDemand;
  }

  const partner = TRADE_PARTNERS_MAP[partnerId];
  if (!partner) {
    return 0.5;
  }
  const bonus = partner.preferredResources.includes(resourceId) ? 0.2 : 0;
  return Math.min(DEMAND_MAX, partner.baseDemand + bonus);
}

/**
 * Initialises the demand map in state from trade partner base values.
 * Called when creating a new game or loading a save without demand data.
 */
export function initialiseDemand(state: GameState): void {
  for (const partner of Object.values(TRADE_PARTNERS_MAP)) {
    if (!state.demand[partner.id]) {
      state.demand[partner.id] = {};
    }
    for (const resourceId of Object.keys(RESOURCES_MAP)) {
      if (state.demand[partner.id][resourceId] === undefined) {
        const bonus = partner.preferredResources.includes(resourceId) ? 0.2 : 0;
        state.demand[partner.id][resourceId] = Math.min(DEMAND_MAX, partner.baseDemand + bonus);
      }
    }
  }
}

/**
 * Returns the price history sparkline data for a resource / partner pair
 * (array of recent prices, oldest first, up to PRICE_HISTORY_LENGTH entries).
 */
export function getPriceHistory(state: GameState, partnerId: string, resourceId: string): number[] {
  return state.priceHistory[partnerId]?.[resourceId] ?? [];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function samplePriceHistory(state: GameState): void {
  for (const [partnerId] of Object.entries(TRADE_PARTNERS_MAP)) {
    if (!state.priceHistory[partnerId]) {
      state.priceHistory[partnerId] = {};
    }
    for (const resourceId of Object.keys(RESOURCES_MAP)) {
      const price = getSellPrice(state, resourceId, partnerId);
      const history = state.priceHistory[partnerId][resourceId] ?? [];
      history.push(price);
      if (history.length > PRICE_HISTORY_LENGTH) {
        history.shift();
      }
      state.priceHistory[partnerId][resourceId] = history;
    }
  }
}
