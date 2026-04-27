export interface TechnologyUnlock {
  type: 'resource' | 'building' | 'recipe' | 'upgrade';
  id: string;
}

export interface Technology {
  id: string;
  nameKey: string;
  descriptionKey: string;
  tier: 1 | 2 | 3 | 4 | 5;
  researchPoints: number;
  moneyCost: number;
  prerequisites: string[];
  unlocks: TechnologyUnlock[];
  duration: number;
  /** Research tree specialization branch. */
  specialization?: 'energy' | 'matter' | 'biology';
  /**
   * Other technology ids that, when all completed alongside this one, provide
   * a combined synergy production bonus.
   */
  synergyWith?: string[];
  /**
   * Production speed multiplier applied when all synergyWith techs are also
   * complete (e.g. 1.25 = +25% production for all buildings of the relevant
   * specialization).
   */
  synergyBonus?: number;
}

export const TECHNOLOGIES: Technology[] = [
  {
    id: 'silicon_extraction',
    nameKey: 'research.silicon_extraction.name',
    descriptionKey: 'research.silicon_extraction.description',
    tier: 1,
    researchPoints: 50,
    moneyCost: 500,
    prerequisites: [],
    unlocks: [
      { type: 'resource', id: 'silicon' },
      { type: 'building', id: 'silicon_extractor' },
      { type: 'building', id: 'circuit_fab' },
    ],
    duration: 60,
  },
  {
    id: 'advanced_fabrication',
    nameKey: 'research.advanced_fabrication.name',
    descriptionKey: 'research.advanced_fabrication.description',
    tier: 1,
    researchPoints: 40,
    moneyCost: 400,
    prerequisites: [],
    unlocks: [
      { type: 'recipe', id: 'steel_components' },
      { type: 'resource', id: 'advanced_components' },
    ],
    duration: 45,
  },
  {
    id: 'uranium_mining',
    nameKey: 'research.uranium_mining.name',
    descriptionKey: 'research.uranium_mining.description',
    tier: 2,
    researchPoints: 100,
    moneyCost: 2000,
    prerequisites: ['silicon_extraction'],
    specialization: 'energy',
    unlocks: [
      { type: 'resource', id: 'uranium' },
      { type: 'building', id: 'uranium_extractor' },
      { type: 'recipe', id: 'uranium_fuel' },
    ],
    duration: 120,
  },
  {
    id: 'plasma_tech',
    nameKey: 'research.plasma_tech.name',
    descriptionKey: 'research.plasma_tech.description',
    tier: 3,
    researchPoints: 200,
    moneyCost: 5000,
    prerequisites: ['uranium_mining'],
    specialization: 'energy',
    synergyWith: ['dark_matter_research'],
    synergyBonus: 1.2,
    unlocks: [
      { type: 'resource', id: 'plasma_crystals' },
      { type: 'building', id: 'exotic_lab' },
      { type: 'recipe', id: 'plasma_exotic' },
      { type: 'resource', id: 'exotic_cores' },
    ],
    duration: 240,
  },
  {
    id: 'dark_matter_research',
    nameKey: 'research.dark_matter_research.name',
    descriptionKey: 'research.dark_matter_research.description',
    tier: 3,
    researchPoints: 250,
    moneyCost: 8000,
    prerequisites: ['plasma_tech'],
    specialization: 'matter',
    synergyWith: ['quantum_physics'],
    synergyBonus: 1.25,
    unlocks: [
      { type: 'resource', id: 'dark_matter_residue' },
      { type: 'recipe', id: 'nano_alloy' },
      { type: 'resource', id: 'nano_alloy' },
    ],
    duration: 300,
  },
  {
    id: 'quantum_physics',
    nameKey: 'research.quantum_physics.name',
    descriptionKey: 'research.quantum_physics.description',
    tier: 3,
    researchPoints: 200,
    moneyCost: 6000,
    prerequisites: ['plasma_tech'],
    specialization: 'matter',
    unlocks: [
      { type: 'resource', id: 'quantum_foam' },
    ],
    duration: 280,
  },
  {
    id: 'biotech',
    nameKey: 'research.biotech.name',
    descriptionKey: 'research.biotech.description',
    tier: 2,
    researchPoints: 120,
    moneyCost: 3000,
    prerequisites: ['silicon_extraction'],
    specialization: 'biology',
    unlocks: [
      { type: 'resource', id: 'synthetic_bio_gel' },
      { type: 'recipe', id: 'bio_circuits' },
      { type: 'resource', id: 'bio_circuits' },
    ],
    duration: 150,
  },
  {
    id: 'antimatter_containment',
    nameKey: 'research.antimatter_containment.name',
    descriptionKey: 'research.antimatter_containment.description',
    tier: 4,
    researchPoints: 500,
    moneyCost: 20000,
    prerequisites: ['dark_matter_research', 'quantum_physics'],
    specialization: 'matter',
    synergyWith: ['plasma_tech', 'quantum_physics'],
    synergyBonus: 1.3,
    unlocks: [
      { type: 'resource', id: 'antimatter_particles' },
      { type: 'resource', id: 'antimatter_core' },
      { type: 'recipe', id: 'antimatter_core' },
      { type: 'building', id: 'quantum_forge' },
    ],
    duration: 600,
  },
  {
    id: 'fast_routes',
    nameKey: 'research.fast_routes.name',
    descriptionKey: 'research.fast_routes.description',
    tier: 1,
    researchPoints: 30,
    moneyCost: 300,
    prerequisites: [],
    unlocks: [
      { type: 'upgrade', id: 'route_speed' },
    ],
    duration: 30,
  },
  {
    id: 'automation',
    nameKey: 'research.automation.name',
    descriptionKey: 'research.automation.description',
    tier: 2,
    researchPoints: 80,
    moneyCost: 2000,
    prerequisites: ['advanced_fabrication'],
    unlocks: [
      { type: 'upgrade', id: 'auto_assign' },
    ],
    duration: 100,
  },
  // -----------------------------------------------------------------------
  // Tier 4 — Advanced Specializations
  // -----------------------------------------------------------------------
  {
    id: 'fusion_reactor',
    nameKey: 'research.fusion_reactor.name',
    descriptionKey: 'research.fusion_reactor.description',
    tier: 4,
    researchPoints: 400,
    moneyCost: 15000,
    prerequisites: ['plasma_tech', 'uranium_mining'],
    specialization: 'energy',
    synergyWith: ['antimatter_containment'],
    synergyBonus: 1.4,
    unlocks: [
      { type: 'building', id: 'fusion_plant' },
      { type: 'recipe', id: 'fusion_power' },
    ],
    duration: 480,
  },
  {
    id: 'advanced_biotech',
    nameKey: 'research.advanced_biotech.name',
    descriptionKey: 'research.advanced_biotech.description',
    tier: 4,
    researchPoints: 380,
    moneyCost: 12000,
    prerequisites: ['biotech', 'dark_matter_research'],
    specialization: 'biology',
    synergyWith: ['biotech'],
    synergyBonus: 1.35,
    unlocks: [
      { type: 'recipe', id: 'nano_bio_gel' },
      { type: 'building', id: 'bio_reactor' },
    ],
    duration: 400,
  },
  // -----------------------------------------------------------------------
  // Tier 5 — Post-Singularity
  // -----------------------------------------------------------------------
  {
    id: 'singularity_engine',
    nameKey: 'research.singularity_engine.name',
    descriptionKey: 'research.singularity_engine.description',
    tier: 5,
    researchPoints: 2000,
    moneyCost: 100000,
    prerequisites: ['antimatter_containment', 'fusion_reactor'],
    specialization: 'energy',
    synergyWith: ['antimatter_containment', 'fusion_reactor'],
    synergyBonus: 1.5,
    unlocks: [
      { type: 'building', id: 'singularity_tap' },
      { type: 'recipe', id: 'void_energy' },
    ],
    duration: 1800,
  },
  {
    id: 'consciousness_upload',
    nameKey: 'research.consciousness_upload.name',
    descriptionKey: 'research.consciousness_upload.description',
    tier: 5,
    researchPoints: 2500,
    moneyCost: 150000,
    prerequisites: ['advanced_biotech', 'quantum_physics'],
    specialization: 'biology',
    synergyWith: ['advanced_biotech', 'quantum_physics'],
    synergyBonus: 1.6,
    unlocks: [
      { type: 'building', id: 'mind_matrix' },
      { type: 'recipe', id: 'neural_substrate' },
    ],
    duration: 2400,
  },
  {
    id: 'reality_engineering',
    nameKey: 'research.reality_engineering.name',
    descriptionKey: 'research.reality_engineering.description',
    tier: 5,
    researchPoints: 3000,
    moneyCost: 200000,
    prerequisites: ['antimatter_containment', 'advanced_biotech', 'fusion_reactor'],
    specialization: 'matter',
    synergyWith: ['singularity_engine', 'consciousness_upload'],
    synergyBonus: 2.0,
    unlocks: [
      { type: 'building', id: 'reality_forge' },
      { type: 'recipe', id: 'reality_shard' },
    ],
    duration: 3600,
  },
];

export const TECHNOLOGIES_MAP: Record<string, Technology> = Object.fromEntries(
  TECHNOLOGIES.map((t) => [t.id, t]),
);
