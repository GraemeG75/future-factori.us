import { describe, it, expect, beforeEach } from 'vitest';
import * as EventSystem from '../systems/EventSystem';
import { createTestGameState } from './testHelpers';
import type { GameState, MarketEvent } from '../game/GameState';

function makeEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    id: 'event-1',
    messageKey: 'events.resource_boom',
    startTick: 0,
    durationTicks: 1000,
    modifier: 1.5,
    affectedResourceId: 'wood',
    ...overrides,
  };
}

describe('EventSystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState({ tick: 0 });
  });

  it('getEventPriceModifier returns 1.0 when no events active', () => {
    state.activeMarketEvents = [];
    const mod = EventSystem.getEventPriceModifier(state, 'wood', 'industrial_corp');
    expect(mod).toBe(1.0);
  });

  it('getEventPriceModifier applies modifier for matching resource event', () => {
    state.activeMarketEvents = [makeEvent({ modifier: 1.8, affectedResourceId: 'wood' })];
    const mod = EventSystem.getEventPriceModifier(state, 'wood', 'industrial_corp');
    expect(mod).toBe(1.8);
  });

  it('getEventPriceModifier does not apply modifier for non-matching resource', () => {
    state.activeMarketEvents = [makeEvent({ modifier: 1.8, affectedResourceId: 'coal' })];
    const mod = EventSystem.getEventPriceModifier(state, 'wood', 'industrial_corp');
    expect(mod).toBe(1.0);
  });

  it('getEventPriceModifier applies modifier for matching partner event', () => {
    state.activeMarketEvents = [
      makeEvent({ modifier: 0.5, affectedPartnerId: 'industrial_corp', affectedResourceId: undefined }),
    ];
    const mod = EventSystem.getEventPriceModifier(state, 'wood', 'industrial_corp');
    expect(mod).toBe(0.5);
  });

  it('getEventPriceModifier does not apply partner modifier for wrong partner', () => {
    state.activeMarketEvents = [
      makeEvent({ modifier: 0.5, affectedPartnerId: 'energy_traders', affectedResourceId: undefined }),
    ];
    const mod = EventSystem.getEventPriceModifier(state, 'wood', 'industrial_corp');
    expect(mod).toBe(1.0);
  });

  it('getEventPriceModifier multiplies modifiers from multiple applicable events', () => {
    state.activeMarketEvents = [
      makeEvent({ id: 'e1', modifier: 2.0, affectedResourceId: 'wood', affectedPartnerId: undefined }),
      makeEvent({ id: 'e2', modifier: 1.5, affectedResourceId: 'wood', affectedPartnerId: undefined }),
    ];
    const mod = EventSystem.getEventPriceModifier(state, 'wood', 'industrial_corp');
    expect(mod).toBeCloseTo(3.0);
  });

  it('getEventPriceModifier applies global event (no resource/partner filter) to everything', () => {
    state.activeMarketEvents = [
      makeEvent({ modifier: 0.6, affectedResourceId: undefined, affectedPartnerId: undefined }),
    ];
    const mod = EventSystem.getEventPriceModifier(state, 'coal', 'energy_traders');
    expect(mod).toBe(0.6);
  });

  it('tick removes events whose duration has elapsed', () => {
    state.tick = 2000;
    state.activeMarketEvents = [makeEvent({ startTick: 0, durationTicks: 1000 })];
    EventSystem.tick(state);
    expect(state.activeMarketEvents).toHaveLength(0);
  });

  it('tick keeps events that have not yet elapsed', () => {
    state.tick = 500;
    state.activeMarketEvents = [makeEvent({ startTick: 0, durationTicks: 1000 })];
    EventSystem.tick(state);
    expect(state.activeMarketEvents).toHaveLength(1);
  });
});
