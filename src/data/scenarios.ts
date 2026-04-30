export type { ScenarioId, ScenarioObjective, Scenario } from '../interfaces/scenarios';
import type { Scenario, ScenarioObjective } from '../interfaces/scenarios';

export const SCENARIOS: Scenario[] = [
  {
    id: 'tutorial',
    nameKey: 'scenarios.tutorial.name',
    descriptionKey: 'scenarios.tutorial.description',
    timeLimitTicks: null,
    startingCash: 5000,
    startingInventory: { wood: 50, coal: 20 },
    startingResearch: [],
    infiniteResources: false,
    scoreMultiplier: 1.0,
    objectives: [
      { id: 'place_factory', descriptionKey: 'scenarios.tutorial.obj_place_factory', type: 'buildings', target: 3 },
      { id: 'earn_cash', descriptionKey: 'scenarios.tutorial.obj_earn_cash', type: 'cash', target: 5000 },
      { id: 'first_research', descriptionKey: 'scenarios.tutorial.obj_first_research', type: 'research', target: 1 }
    ]
  },
  {
    id: 'fast_start',
    nameKey: 'scenarios.fast_start.name',
    descriptionKey: 'scenarios.fast_start.description',
    timeLimitTicks: 72000, // ~1 hour at 20tps × 1x speed
    startingCash: 10000,
    startingInventory: { wood: 100, coal: 100, iron_ore: 50, steel: 20 },
    startingResearch: ['fast_routes', 'advanced_fabrication'],
    infiniteResources: false,
    scoreMultiplier: 1.5,
    objectives: [
      { id: 'earn_50k', descriptionKey: 'scenarios.fast_start.obj_earn_50k', type: 'cash', target: 50000 },
      { id: 'ten_buildings', descriptionKey: 'scenarios.fast_start.obj_ten_buildings', type: 'buildings', target: 10 }
    ]
  },
  {
    id: 'survival',
    nameKey: 'scenarios.survival.name',
    descriptionKey: 'scenarios.survival.description',
    timeLimitTicks: 144000,
    startingCash: 500,
    startingInventory: {},
    startingResearch: [],
    infiniteResources: false,
    scoreMultiplier: 2.5,
    objectives: [
      { id: 'survive', descriptionKey: 'scenarios.survival.obj_survive', type: 'cash', target: 1 },
      { id: 'complete_contracts', descriptionKey: 'scenarios.survival.obj_contracts', type: 'contracts', target: 5 }
    ]
  },
  {
    id: 'sandbox',
    nameKey: 'scenarios.sandbox.name',
    descriptionKey: 'scenarios.sandbox.description',
    timeLimitTicks: null,
    startingCash: 999999,
    startingInventory: { wood: 9999, coal: 9999, iron_ore: 9999, water: 9999, steel: 9999 },
    startingResearch: [
      'silicon_extraction',
      'advanced_fabrication',
      'fast_routes',
      'automation',
      'uranium_mining',
      'biotech',
      'plasma_tech',
      'dark_matter_research',
      'quantum_physics',
      'antimatter_containment',
      'fusion_reactor',
      'advanced_biotech'
    ],
    infiniteResources: true,
    scoreMultiplier: 0.1,
    objectives: []
  }
];

export const SCENARIOS_MAP: Record<string, Scenario> = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));
