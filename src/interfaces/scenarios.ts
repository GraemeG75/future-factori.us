export type ScenarioId = 'tutorial' | 'fast_start' | 'survival' | 'sandbox';

export interface ScenarioObjective {
  id: string;
  descriptionKey: string;
  /** Check function description (checked by ScenarioSystem) */
  type: 'cash' | 'buildings' | 'research' | 'contracts' | 'trade' | 'custom';
  target: number;
  /** Optional resource or tech id for contextual checks */
  resourceId?: string;
  techId?: string;
  buildingTypeId?: string;
}

export interface Scenario {
  id: ScenarioId;
  nameKey: string;
  descriptionKey: string;
  /** If set, game ends when tick exceeds this */
  timeLimitTicks: number | null;
  /** Starting cash override (null = default 2500) */
  startingCash: number | null;
  /** Starting inventory overrides */
  startingInventory: Record<string, number>;
  /** Starting completed research (unlocks buildings too) */
  startingResearch: string[];
  /** Whether resource deposits are infinite */
  infiniteResources: boolean;
  objectives: ScenarioObjective[];
  /** Score formula multiplier */
  scoreMultiplier: number;
}
