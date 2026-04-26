export interface Achievement {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_building',
    nameKey: 'achievements.first_building.name',
    descriptionKey: 'achievements.first_building.description',
    icon: '🏗️',
  },
  {
    id: 'power_up',
    nameKey: 'achievements.power_up.name',
    descriptionKey: 'achievements.power_up.description',
    icon: '⚡',
  },
  {
    id: 'first_sale',
    nameKey: 'achievements.first_sale.name',
    descriptionKey: 'achievements.first_sale.description',
    icon: '💰',
  },
  {
    id: 'five_buildings',
    nameKey: 'achievements.five_buildings.name',
    descriptionKey: 'achievements.five_buildings.description',
    icon: '🏭',
  },
  {
    id: 'ten_buildings',
    nameKey: 'achievements.ten_buildings.name',
    descriptionKey: 'achievements.ten_buildings.description',
    icon: '🌆',
  },
  {
    id: 'first_research',
    nameKey: 'achievements.first_research.name',
    descriptionKey: 'achievements.first_research.description',
    icon: '🔬',
  },
  {
    id: 'cash_1k',
    nameKey: 'achievements.cash_1k.name',
    descriptionKey: 'achievements.cash_1k.description',
    icon: '💵',
  },
  {
    id: 'cash_10k',
    nameKey: 'achievements.cash_10k.name',
    descriptionKey: 'achievements.cash_10k.description',
    icon: '💴',
  },
  {
    id: 'cash_100k',
    nameKey: 'achievements.cash_100k.name',
    descriptionKey: 'achievements.cash_100k.description',
    icon: '💎',
  },
  {
    id: 'five_routes',
    nameKey: 'achievements.five_routes.name',
    descriptionKey: 'achievements.five_routes.description',
    icon: '🚚',
  },
  {
    id: 'repair_crew',
    nameKey: 'achievements.repair_crew.name',
    descriptionKey: 'achievements.repair_crew.description',
    icon: '🔧',
  },
  {
    id: 'polluter',
    nameKey: 'achievements.polluter.name',
    descriptionKey: 'achievements.polluter.description',
    icon: '🏭',
  },
  {
    id: 'clean_factory',
    nameKey: 'achievements.clean_factory.name',
    descriptionKey: 'achievements.clean_factory.description',
    icon: '🌿',
  },
  {
    id: 'deposit_depleted',
    nameKey: 'achievements.deposit_depleted.name',
    descriptionKey: 'achievements.deposit_depleted.description',
    icon: '⛏️',
  },
  // v0.4.0 — Economy & Trade
  {
    id: 'first_contract',
    nameKey: 'achievements.first_contract.name',
    descriptionKey: 'achievements.first_contract.description',
    icon: '📋',
  },
  {
    id: 'ten_contracts',
    nameKey: 'achievements.ten_contracts.name',
    descriptionKey: 'achievements.ten_contracts.description',
    icon: '📦',
  },
  {
    id: 'first_loan',
    nameKey: 'achievements.first_loan.name',
    descriptionKey: 'achievements.first_loan.description',
    icon: '🏦',
  },
  {
    id: 'debt_free',
    nameKey: 'achievements.debt_free.name',
    descriptionKey: 'achievements.debt_free.description',
    icon: '✅',
  },
  {
    id: 'market_event',
    nameKey: 'achievements.market_event.name',
    descriptionKey: 'achievements.market_event.description',
    icon: '📈',
  },
  // v0.5.0 — Research & Progression
  {
    id: 'tier5_research',
    nameKey: 'achievements.tier5_research.name',
    descriptionKey: 'achievements.tier5_research.description',
    icon: '🚀',
  },
  {
    id: 'synergy_active',
    nameKey: 'achievements.synergy_active.name',
    descriptionKey: 'achievements.synergy_active.description',
    icon: '🔗',
  },
  {
    id: 'prototype_built',
    nameKey: 'achievements.prototype_built.name',
    descriptionKey: 'achievements.prototype_built.description',
    icon: '🔩',
  },
];

export const ACHIEVEMENTS_MAP: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
