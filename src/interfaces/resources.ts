export interface ResourceType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  tier: 'basic' | 'intermediate' | 'advanced' | 'exotic';
  basePrice: number;
  storageSize: number;
  unlockRequirement?: string;
  color: string;
  icon: string;
}
