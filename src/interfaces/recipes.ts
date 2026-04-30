export interface RecipeIngredient {
  resourceId: string;
  amount: number;
}

export interface Recipe {
  id: string;
  nameKey: string;
  descriptionKey: string;
  buildingTypeId: string;
  inputs: RecipeIngredient[];
  outputs: RecipeIngredient[];
  processingTimeSeconds: number;
  unlockRequirement?: string;
}
