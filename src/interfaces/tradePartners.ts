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
