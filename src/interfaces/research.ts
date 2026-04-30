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
