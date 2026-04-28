import type { MarketEvent, GameState } from '../game/GameState';
import { RESOURCES } from '../data/resources';
import { TRADE_PARTNERS } from '../data/tradePartners';
import { EVENT_CHECK_INTERVAL, EVENT_CHANCE, MAX_ACTIVE_EVENTS, EVENT_TEMPLATES } from '../consts/events';

/**
 * Advances market event logic: expires old events and randomly spawns new ones.
 */
export function tick(state: GameState): void {
  // Remove events that have expired
  state.activeMarketEvents = state.activeMarketEvents.filter((e) => state.tick < e.startTick + e.durationTicks);

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
    const availablePartners = TRADE_PARTNERS.filter((p) => !p.unlockRequirement || state.completedResearch.includes(p.unlockRequirement));
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
    modifier: template.modifier
  };

  state.activeMarketEvents.push(event);

  state.alerts.push({
    id: crypto.randomUUID(),
    tick: state.tick,
    type: event.modifier >= 1 ? 'info' : 'warning',
    messageKey: template.messageKey,
    params: affectedResourceId ? [affectedResourceId] : affectedPartnerId ? [affectedPartnerId] : []
  });
}

/**
 * Returns the combined event price modifier for a given resource + partner pair.
 * Multipliers from all applicable events are multiplied together.
 */
export function getEventPriceModifier(state: GameState, resourceId: string, partnerId: string): number {
  let combined = 1.0;
  for (const event of state.activeMarketEvents) {
    if (event.affectedResourceId && event.affectedResourceId !== resourceId) continue;
    if (event.affectedPartnerId && event.affectedPartnerId !== partnerId) continue;
    combined *= event.modifier;
  }
  return combined;
}
