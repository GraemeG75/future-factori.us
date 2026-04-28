/** How often (in ticks) to potentially generate a market event. */
export const EVENT_CHECK_INTERVAL = 1200;
/** Chance (0-1) of generating an event when checked. */
export const EVENT_CHANCE = 0.35;
/** Maximum simultaneous active market events. */
export const MAX_ACTIVE_EVENTS = 3;

export const EVENT_TEMPLATES: ReadonlyArray<{
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
  { messageKey: 'events.pollution_fine', modifier: 0.7, durationTicks: 1800, targetsResource: false, targetsPartner: false }
];
