import type { GameState } from '../game/GameState';
import { SCENARIOS_MAP } from '../data/scenarios';
import type { ScenarioObjective } from '../data/scenarios';

export function checkObjective(state: GameState, obj: ScenarioObjective): boolean {
  switch (obj.type) {
    case 'cash':
      return state.cash >= obj.target;
    case 'buildings':
      return state.buildings.length >= obj.target;
    case 'research':
      return state.completedResearch.length >= obj.target;
    case 'contracts':
      return state.contracts.filter(c => c.status === 'completed').length >= obj.target;
    case 'trade':
      return state.tradeHistory.length >= obj.target;
    default:
      return false;
  }
}

export function areAllObjectivesComplete(state: GameState): boolean {
  const scenario = state.activeScenarioId ? SCENARIOS_MAP[state.activeScenarioId] : null;
  if (!scenario || scenario.objectives.length === 0) return false;
  return scenario.objectives.every(obj => checkObjective(state, obj));
}

export function isTimedOut(state: GameState): boolean {
  const scenario = state.activeScenarioId ? SCENARIOS_MAP[state.activeScenarioId] : null;
  if (!scenario || scenario.timeLimitTicks === null) return false;
  return state.tick >= scenario.timeLimitTicks;
}

export function calculateScore(state: GameState): number {
  const scenario = state.activeScenarioId ? SCENARIOS_MAP[state.activeScenarioId] : null;
  const multiplier = scenario?.scoreMultiplier ?? 1.0;
  const completedContracts = state.contracts.filter(c => c.status === 'completed').length;
  const baseScore = Math.floor(state.cash / 10) + completedContracts * 500 + state.completedResearch.length * 200;
  return Math.floor(baseScore * multiplier);
}

export function tick(state: GameState): void {
  if (!state.activeScenarioId || state.scenarioStatus !== 'active') return;

  const scenario = SCENARIOS_MAP[state.activeScenarioId];
  if (!scenario) return;

  // Check time limit
  if (scenario.timeLimitTicks !== null && state.tick >= scenario.timeLimitTicks) {
    state.scenarioStatus = areAllObjectivesComplete(state) ? 'won' : 'lost';
    state.scenarioScore = calculateScore(state);
    return;
  }

  // Check win condition (all objectives complete)
  if (scenario.objectives.length > 0 && areAllObjectivesComplete(state)) {
    state.scenarioStatus = 'won';
    state.scenarioScore = calculateScore(state);
  }
}

export function startScenario(state: GameState, scenarioId: string): boolean {
  const scenario = SCENARIOS_MAP[scenarioId];
  if (!scenario) return false;
  state.activeScenarioId = scenarioId;
  state.scenarioStatus = 'active';
  state.scenarioScore = 0;
  // Apply starting bonuses
  if (scenario.startingCash !== null) state.cash = scenario.startingCash;
  for (const [resId, amt] of Object.entries(scenario.startingInventory)) {
    state.inventory[resId] = (state.inventory[resId] ?? 0) + amt;
  }
  for (const techId of scenario.startingResearch) {
    if (!state.completedResearch.includes(techId)) {
      state.completedResearch.push(techId);
    }
  }
  state.sandboxMode = scenario.infiniteResources;
  return true;
}
