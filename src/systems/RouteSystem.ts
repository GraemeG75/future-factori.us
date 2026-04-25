import type { RouteInstance, GameState } from '../game/GameState';
import { addResource } from './ResourceSystem';

/** Default cost deducted from cash per delivery trip. */
const DEFAULT_COST_PER_TRIP = 0.5;
/** Minimum travel distance to avoid division by zero. */
const MIN_DISTANCE = 1;

/**
 * Creates a new transport route between two buildings.
 * Returns null if either building does not exist.
 */
export function createRoute(
  state: GameState,
  fromId: string,
  toId: string,
  resourceId: string,
  capacity: number,
): RouteInstance | null {
  const from = state.buildings.find((b) => b.id === fromId);
  const to = state.buildings.find((b) => b.id === toId);
  if (!from || !to) return null;

  const route: RouteInstance = {
    id: crypto.randomUUID(),
    fromBuildingId: fromId,
    toBuildingId: toId,
    resourceId,
    capacity,
    speed: 10, // world units per second default
    currentLoad: 0,
    progress: 0,
    isActive: true,
    costPerTrip: DEFAULT_COST_PER_TRIP,
  };

  state.routes.push(route);
  from.assignedRouteIds.push(route.id);
  to.assignedRouteIds.push(route.id);
  return route;
}

/**
 * Removes a route from the game and cleans up building references.
 */
export function removeRoute(state: GameState, routeId: string): void {
  state.routes = state.routes.filter((r) => r.id !== routeId);
  for (const building of state.buildings) {
    building.assignedRouteIds = building.assignedRouteIds.filter((id) => id !== routeId);
  }
}

/**
 * Advances all active routes by deltaSeconds.
 * Cargo is picked up from the source building's outputBuffer (falling back to
 * global inventory) and delivered to the destination building's inputBuffer
 * (falling back to global inventory).
 */
export function tick(state: GameState, deltaSeconds: number): void {
  for (const route of state.routes) {
    if (!route.isActive) continue;

    const from = state.buildings.find((b) => b.id === route.fromBuildingId);
    const to = state.buildings.find((b) => b.id === route.toBuildingId);
    if (!from || !to) continue;

    if (route.currentLoad > 0) {
      // In transit – advance progress
      const distance = calcDistance(from.position, to.position);
      route.progress += (route.speed * deltaSeconds) / distance;

      if (route.progress >= 1) {
        route.progress = 0;
        // Deliver to destination inputBuffer, overflow to inventory
        const incoming = route.currentLoad;
        const bufferCapacity = 100; // simple per-slot cap for input buffers
        const buffered = to.inputBuffer[route.resourceId] ?? 0;
        const canBuffer = Math.max(0, bufferCapacity - buffered);
        const toBuffer = Math.min(incoming, canBuffer);
        to.inputBuffer[route.resourceId] = buffered + toBuffer;
        const overflow = incoming - toBuffer;
        if (overflow > 0) {
          addResource(state, route.resourceId, overflow);
        }

        // Deduct delivery cost
        state.cash -= route.costPerTrip;

        route.currentLoad = 0;
        // Immediately attempt reload
        tryLoad(state, route, from);
      }
    } else {
      // Waiting at source – try to load
      tryLoad(state, route, from);
    }
  }
}

/** Returns a route by id, or undefined if not found. */
export function getRouteById(state: GameState, id: string): RouteInstance | undefined {
  return state.routes.find((r) => r.id === id);
}

/** Returns all routes that involve a given building (as source or destination). */
export function getRoutesForBuilding(state: GameState, buildingId: string): RouteInstance[] {
  return state.routes.filter(
    (r) => r.fromBuildingId === buildingId || r.toBuildingId === buildingId,
  );
}

/**
 * Returns the average throughput of a route in units per minute, based on
 * the capacity and current travel speed over an estimated trip duration.
 */
export function getRouteThroughput(route: RouteInstance): number {
  if (route.speed <= 0) return 0;
  // Estimate round-trip time; without building positions just use speed ratio.
  const estimatedTripSeconds = 1 / route.speed;
  return (route.capacity / estimatedTripSeconds) * 60;
}

/**
 * Returns true if both endpoint buildings still exist in the game state.
 */
export function isRouteValid(state: GameState, route: RouteInstance): boolean {
  const hasFrom = state.buildings.some((b) => b.id === route.fromBuildingId);
  const hasTo = state.buildings.some((b) => b.id === route.toBuildingId);
  return hasFrom && hasTo;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calcDistance(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  return Math.max(MIN_DISTANCE, Math.sqrt(dx * dx + dz * dz));
}

/**
 * Attempts to load cargo from the source building's outputBuffer (then global
 * inventory) onto the route.
 */
function tryLoad(
  state: GameState,
  route: RouteInstance,
  from: { outputBuffer: Record<string, number> },
): void {
  const outputAmount = from.outputBuffer[route.resourceId] ?? 0;
  const inventoryAmount = state.inventory[route.resourceId] ?? 0;
  const totalAvailable = outputAmount + inventoryAmount;

  if (totalAvailable <= 0) return;

  const toLoad = Math.min(route.capacity, totalAvailable);

  // Drain outputBuffer first
  const fromOutput = Math.min(toLoad, outputAmount);
  from.outputBuffer[route.resourceId] = outputAmount - fromOutput;
  let remaining = toLoad - fromOutput;

  // Then drain global inventory
  if (remaining > 0) {
    const fromInventory = Math.min(remaining, inventoryAmount);
    state.inventory[route.resourceId] = inventoryAmount - fromInventory;
    remaining -= fromInventory;
  }

  route.currentLoad = toLoad - remaining;
}
