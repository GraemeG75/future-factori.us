export interface TradePartner {
  id: string;
  nameKey: string;
  descriptionKey: string;
  preferredResources: string[];
  baseDemand: number;
  priceModifier: number;
  unlockRequirement?: string;
  position: { x: number; z: number };
}

export const TRADE_PARTNERS: TradePartner[] = [
  {
    id: 'industrial_corp',
    nameKey: 'tradePartners.industrial_corp.name',
    descriptionKey: 'tradePartners.industrial_corp.description',
    preferredResources: ['steel', 'basic_components', 'circuits'],
    baseDemand: 0.8,
    priceModifier: 1.0,
    position: { x: 200, z: 50 },
  },
  {
    id: 'energy_traders',
    nameKey: 'tradePartners.energy_traders.name',
    descriptionKey: 'tradePartners.energy_traders.description',
    preferredResources: ['fuel', 'uranium', 'coal'],
    baseDemand: 0.7,
    priceModifier: 1.25,
    position: { x: -150, z: 180 },
  },
  {
    id: 'research_institute',
    nameKey: 'tradePartners.research_institute.name',
    descriptionKey: 'tradePartners.research_institute.description',
    preferredResources: ['exotic_cores', 'bio_circuits', 'nano_alloy'],
    baseDemand: 0.5,
    priceModifier: 1.6,
    unlockRequirement: 'plasma_tech',
    position: { x: 300, z: -200 },
  },
  {
    id: 'colony_supply',
    nameKey: 'tradePartners.colony_supply.name',
    descriptionKey: 'tradePartners.colony_supply.description',
    preferredResources: ['water', 'basic_components', 'fuel'],
    baseDemand: 0.9,
    priceModifier: 0.9,
    position: { x: -250, z: -100 },
  },
];

export const TRADE_PARTNERS_MAP: Record<string, TradePartner> = Object.fromEntries(
  TRADE_PARTNERS.map((p) => [p.id, p]),
);

export const DEFAULT_TRADE_PARTNER: TradePartner = TRADE_PARTNERS_MAP['industrial_corp'];
