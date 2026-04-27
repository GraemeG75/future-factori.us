import type { MarketEvent, GameState } from '../game/GameState';
import { RESOURCES } from '../data/resources';
import { TRADE_PARTNERS } from '../data/tradePartners';

/** How often (in ticks) to potentially generate a market event. */
const EVENT_CHECK_INTERVAL = 1200; // every 60 s
/** Chance (0-1) of generating an event when checked. */
const EVENT_CHANCE = 0.35;
/** Maximum simultaneous active market events. */
const MAX_ACTIVE_EVENTS = 3;

const EVENT_TEMPLATES: ReadonlyArray<{
  messageKey: string;
  modifier: number;
  durationTicks: number;
  targetsResource: boolean;
  targetsPartner: boolean;
}> = [
  { messageKey: 'events.trade_embargo', modifier: 0.5, durationTicks: 2400, targetsResource: false, targetsPartner: true },
  { messageKey: 'events.resource_boom', modifier: 1.8, durationTicks: 1800, targetsResource: true, targetsPartner: false },
  { messageKey: 'events.market_crash', modifier: 0.6, durationTicks: 3000, targetsResource: false, targetsPartner: false },
  { messageKey: 'events.subsidy', modifier: 1.4, durationTicks: 1200, targetsResource: true, targetsPartner: false },
  { messageKey: 'events.tech_demand_surge', modifier: 2.0, durationTicks: 900, targetsResource: true, targetsPartner: false },
  { messageKey: 'events.pollution_fine', modifier: 0.7, durationTicks: 1800, targetsResource: false, targetsPartner: false },
];

/**
 * Advances market event logic: expires old events and randomly spawns new ones.
 */
export function tick(state: GameState): void {
  // Remove events that have expired
  state.activeMarketEvents = state.activeMarketEvents.filter(
    (e) => state.tick < e.startTick + e.durationTicks,
  );

  if (state.tick % EVENT_CHECK_INTERVAL !== 0) return;
  if (state.activeMarketEvents.length >= MAX_ACTIVE_EVENTS) return;
  if (Math.random() > EVENT_CHANCE) return;

  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)]!;

  let affectedResourceId: string | undefined;
  let affectedPartnerId: string | undefined;

  if (template.targetsResource && RESOURCES.length > 0) {
    const basicResources = RESOURCES.filter((r) => !r.unlockRequirement);
    const pool = basicResources.length > 0 ? basicResources : RESOURCES;
    affectedResourceId = pool[Math.floor(Math.random() * pool.length)]!.id;
  }

  if (template.targetsPartner && TRADE_PARTNERS.length > 0) {
    const availablePartners = TRADE_PARTNERS.filter(
      (p) => !p.unlockRequirement || state.completedResearch.includes(p.unlockRequirement),
    );
    if (availablePartners.length > 0) {
      affectedPartnerId = availablePartners[Math.floor(Math.random() * availablePartners.length)]!.id;
    }
  }

  const event: MarketEvent = {
    id: crypto.randomUUID(),
    messageKey: template.messageKey,
    startTick: state.tick,
    durationTicks: template.durationTicks,
    affectedResourceId,
    affectedPartnerId,
    modifier: template.modifier,
  };

  state.activeMarketEvents.push(event);

  state.alerts.push({
    id: crypto.randomUUID(),
    tick: state.tick,
    type: event.modifier >= 1 ? 'info' : 'warning',
    messageKey: template.messageKey,
    params: affectedResourceId ? [affectedResourceId] : affectedPartnerId ? [affectedPartnerId] : [],
  });
}

/**
 * Returns the combined event price modifier for a given resource + partner pair.
 * Multipliers from all applicable events are multiplied together.
 */
export function getEventPriceModifier(
  state: GameState,
  resourceId: string,
  partnerId: string,
): number {
  let combined = 1.0;
  for (const event of state.activeMarketEvents) {
    if (event.affectedResourceId && event.affectedResourceId !== resourceId) continue;
    if (event.affectedPartnerId && event.affectedPartnerId !== partnerId) continue;
    combined *= event.modifier;
  }
  return combined;
}
