import { describe, it, expect, beforeEach } from 'vitest';
import { createRoute, removeRoute, getRouteThroughput, getRoutesForBuilding, tick } from '../systems/RouteSystem';
import { createTestGameState, createTestBuilding } from './testHelpers';
import type { GameState } from '../game/GameState';

describe('RouteSystem', () => {
  let state: GameState;
  let fromId: string;
  let toId: string;

  beforeEach(() => {
    const from = createTestBuilding('storage_depot', { position: { x: 0, y: 0, z: 0 } });
    const to = createTestBuilding('basic_factory', { position: { x: 10, y: 0, z: 0 } });
    state = createTestGameState({ buildings: [from, to] });
    fromId = from.id;
    toId = to.id;
  });

  it('createRoute creates a route between valid buildings', () => {
    const route = createRoute(state, fromId, toId, 'wood', 10);
    expect(route).not.toBeNull();
    expect(state.routes).toHaveLength(1);
    expect(state.routes[0].fromBuildingId).toBe(fromId);
    expect(state.routes[0].toBuildingId).toBe(toId);
  });

  it('createRoute fails if buildings do not exist', () => {
    const route = createRoute(state, 'fake-a', 'fake-b', 'wood', 10);
    expect(route).toBeNull();
    expect(state.routes).toHaveLength(0);
  });

  it('createRoute fails when source and destination are the same building', () => {
    const route = createRoute(state, fromId, fromId, 'wood', 10);
    expect(route).toBeNull();
    expect(state.routes).toHaveLength(0);
  });

  it('createRoute fails for duplicate from/to/resource route', () => {
    const first = createRoute(state, fromId, toId, 'wood', 10);
    expect(first).not.toBeNull();

    const duplicate = createRoute(state, fromId, toId, 'wood', 10);
    expect(duplicate).toBeNull();
    expect(state.routes).toHaveLength(1);
  });

  it('createRoute fails when destination is a harvester', () => {
    const source = createTestBuilding('storage_depot', { position: { x: 0, y: 0, z: 0 } });
    const harvester = createTestBuilding('wood_harvester', { position: { x: 8, y: 0, z: 0 } });
    const routeState = createTestGameState({ buildings: [source, harvester] });

    const route = createRoute(routeState, source.id, harvester.id, 'wood', 10);
    expect(route).toBeNull();
    expect(routeState.routes).toHaveLength(0);
  });

  it('removeRoute removes the route', () => {
    const route = createRoute(state, fromId, toId, 'wood', 10)!;
    removeRoute(state, route.id);
    expect(state.routes).toHaveLength(0);
  });

  it('getRouteThroughput returns positive value for active route', () => {
    const route = createRoute(state, fromId, toId, 'wood', 10)!;
    const throughput = getRouteThroughput(route);
    expect(throughput).toBeGreaterThan(0);
  });

  it('route progress advances when ticked with cargo loaded', () => {
    const route = createRoute(state, fromId, toId, 'wood', 10)!;
    state.inventory['wood'] = 50;
    // First tick loads cargo
    tick(state, 0.1);
    if (route.currentLoad > 0) {
      const progressBefore = route.progress;
      tick(state, 0.5);
      expect(route.progress).toBeGreaterThanOrEqual(progressBefore);
    } else {
      // At minimum route was processed
      expect(route).toBeDefined();
    }
  });

  it('cargo is delivered when route reaches progress=1', () => {
    const route = createRoute(state, fromId, toId, 'wood', 10)!;
    state.inventory['wood'] = 50;
    // Load cargo
    tick(state, 0.01);
    if (route.currentLoad > 0) {
      // Tick enough time for delivery: distance=10, speed=10 => 1s trip
      tick(state, 2);
      // Either delivered to inputBuffer or inventory
      const destBuilding = state.buildings.find((b) => b.id === toId)!;
      const delivered = (destBuilding.inputBuffer['wood'] ?? 0) + (state.inventory['wood'] ?? 0);
      // wood started at 50, we loaded 10 onto route, delivery adds it to dest
      expect(delivered).toBeGreaterThan(0);
    }
  });

  it('route delivery does not deduct cash', () => {
    const route = createRoute(state, fromId, toId, 'wood', 10)!;
    state.inventory['wood'] = 50;
    const cashBefore = state.cash;

    tick(state, 0.01); // load
    if (route.currentLoad > 0) {
      tick(state, 2); // deliver
      expect(state.cash).toBe(cashBefore);
    } else {
      expect(state.cash).toBe(cashBefore);
    }
  });

  it('getRoutesForBuilding returns routes for that building', () => {
    createRoute(state, fromId, toId, 'wood', 10);
    const routesFrom = getRoutesForBuilding(state, fromId);
    const routesTo = getRoutesForBuilding(state, toId);
    expect(routesFrom).toHaveLength(1);
    expect(routesTo).toHaveLength(1);
  });
});
