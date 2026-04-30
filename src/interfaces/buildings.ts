export interface BuildingType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  category: 'harvester' | 'factory' | 'refinery' | 'storage' | 'research' | 'power' | 'trade' | 'prototype' | 'infrastructure';
  baseCost: number;
  baseMaintenanceCostPerTick: number;
  basePowerUsage: number;
  maxLevel: number;
  upgradeCostMultiplier: number;
  productionRateMultiplier: number;
  unlockRequirement?: string;
  size: { width: number; depth: number };
  defaultColor: string;
}
