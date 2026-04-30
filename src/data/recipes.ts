export type { RecipeIngredient, Recipe } from '../interfaces/recipes';
import type { RecipeIngredient, Recipe } from '../interfaces/recipes';

export const RECIPES: Recipe[] = [
  {
    id: 'wood_to_components',
    nameKey: 'recipes.wood_to_components.name',
    descriptionKey: 'recipes.wood_to_components.description',
    buildingTypeId: 'basic_factory',
    inputs: [
      { resourceId: 'wood', amount: 2 },
      { resourceId: 'coal', amount: 1 }
    ],
    outputs: [{ resourceId: 'basic_components', amount: 3 }],
    processingTimeSeconds: 10
  },
  {
    id: 'ore_to_steel',
    nameKey: 'recipes.ore_to_steel.name',
    descriptionKey: 'recipes.ore_to_steel.description',
    buildingTypeId: 'smelter',
    inputs: [
      { resourceId: 'iron_ore', amount: 3 },
      { resourceId: 'coal', amount: 2 }
    ],
    outputs: [{ resourceId: 'steel', amount: 2 }],
    processingTimeSeconds: 15
  },
  {
    id: 'silicon_circuits',
    nameKey: 'recipes.silicon_circuits.name',
    descriptionKey: 'recipes.silicon_circuits.description',
    buildingTypeId: 'circuit_fab',
    inputs: [
      { resourceId: 'silicon', amount: 2 },
      { resourceId: 'water', amount: 1 }
    ],
    outputs: [{ resourceId: 'circuits', amount: 3 }],
    processingTimeSeconds: 12
  },
  {
    id: 'coal_fuel',
    nameKey: 'recipes.coal_fuel.name',
    descriptionKey: 'recipes.coal_fuel.description',
    buildingTypeId: 'refinery',
    inputs: [
      { resourceId: 'coal', amount: 2 },
      { resourceId: 'water', amount: 3 }
    ],
    outputs: [{ resourceId: 'fuel', amount: 2 }],
    processingTimeSeconds: 8
  },
  {
    id: 'steel_components',
    nameKey: 'recipes.steel_components.name',
    descriptionKey: 'recipes.steel_components.description',
    buildingTypeId: 'basic_factory',
    inputs: [
      { resourceId: 'steel', amount: 2 },
      { resourceId: 'basic_components', amount: 1 }
    ],
    outputs: [{ resourceId: 'advanced_components', amount: 3 }],
    processingTimeSeconds: 20,
    unlockRequirement: 'advanced_fabrication'
  },
  {
    id: 'plasma_exotic',
    nameKey: 'recipes.plasma_exotic.name',
    descriptionKey: 'recipes.plasma_exotic.description',
    buildingTypeId: 'exotic_lab',
    inputs: [
      { resourceId: 'plasma_crystals', amount: 1 },
      { resourceId: 'quantum_foam', amount: 2 }
    ],
    outputs: [{ resourceId: 'exotic_cores', amount: 1 }],
    processingTimeSeconds: 60,
    unlockRequirement: 'plasma_tech'
  },
  {
    id: 'nano_alloy',
    nameKey: 'recipes.nano_alloy.name',
    descriptionKey: 'recipes.nano_alloy.description',
    buildingTypeId: 'exotic_lab',
    inputs: [
      { resourceId: 'steel', amount: 3 },
      { resourceId: 'dark_matter_residue', amount: 1 }
    ],
    outputs: [{ resourceId: 'nano_alloy', amount: 2 }],
    processingTimeSeconds: 45,
    unlockRequirement: 'dark_matter_research'
  },
  {
    id: 'bio_circuits',
    nameKey: 'recipes.bio_circuits.name',
    descriptionKey: 'recipes.bio_circuits.description',
    buildingTypeId: 'circuit_fab',
    inputs: [
      { resourceId: 'circuits', amount: 1 },
      { resourceId: 'synthetic_bio_gel', amount: 2 }
    ],
    outputs: [{ resourceId: 'bio_circuits', amount: 2 }],
    processingTimeSeconds: 30,
    unlockRequirement: 'biotech'
  },
  {
    id: 'uranium_fuel',
    nameKey: 'recipes.uranium_fuel.name',
    descriptionKey: 'recipes.uranium_fuel.description',
    buildingTypeId: 'refinery',
    inputs: [
      { resourceId: 'uranium', amount: 1 },
      { resourceId: 'water', amount: 2 }
    ],
    outputs: [{ resourceId: 'fuel', amount: 5 }],
    processingTimeSeconds: 20,
    unlockRequirement: 'uranium_mining'
  },
  {
    id: 'antimatter_core',
    nameKey: 'recipes.antimatter_core.name',
    descriptionKey: 'recipes.antimatter_core.description',
    buildingTypeId: 'exotic_lab',
    inputs: [
      { resourceId: 'antimatter_particles', amount: 1 },
      { resourceId: 'exotic_cores', amount: 1 }
    ],
    outputs: [{ resourceId: 'antimatter_core', amount: 1 }],
    processingTimeSeconds: 120,
    unlockRequirement: 'antimatter_containment'
  },
  {
    id: 'wood_charcoal',
    nameKey: 'recipes.wood_charcoal.name',
    descriptionKey: 'recipes.wood_charcoal.description',
    buildingTypeId: 'smelter',
    inputs: [{ resourceId: 'wood', amount: 3 }],
    outputs: [{ resourceId: 'coal', amount: 2 }],
    processingTimeSeconds: 12
  }
];

export const RECIPES_MAP: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
