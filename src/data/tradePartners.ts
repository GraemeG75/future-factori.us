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
    id: 'black_market',
    nameKey: 'tradePartners.black_market.name',
    descriptionKey: 'tradePartners.black_market.description',
    preferredResources: ['antimatter_particles', 'dark_matter_residue', 'quantum_foam'],
    baseDemand: 0.6,
    priceModifier: 2.0,
    unlockRequirement: 'dark_matter_research',
    position: { x: 0, z: 300 },
  },
  {
    id: 'terraformers',
    nameKey: 'tradePartners.terraformers.name',
    descriptionKey: 'tradePartners.terraformers.description',
    preferredResources: ['synthetic_bio_gel', 'water', 'bio_circuits', 'exotic_cores'],
    baseDemand: 0.75,
    priceModifier: 1.4,
    unlockRequirement: 'biotech',
    position: { x: -300, z: 200 },
  },
];

export const TRADE_PARTNERS_MAP: Record<string, TradePartner> = Object.fromEntries(
  TRADE_PARTNERS.map((p) => [p.id, p]),
);

export const DEFAULT_TRADE_PARTNER: TradePartner = TRADE_PARTNERS_MAP['industrial_corp'];
