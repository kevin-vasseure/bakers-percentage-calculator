import type { Ingredient } from '../stores/ingredientsStore';

export function calculateTotalWeight(ingredients: Ingredient[]): number {
	return ingredients.reduce((sum, ing) => sum + (ing.amount || 0), 0);
}

export function getFlourCount(ingredients: Ingredient[]): number {
	return ingredients.filter((ing) => ing.isFlour).length;
}

export function getTotalFlourWeight(ingredients: Ingredient[]): number {
	return ingredients
		.filter((ing) => ing.isFlour)
		.reduce((sum, ing) => sum + ing.amount, 0);
}