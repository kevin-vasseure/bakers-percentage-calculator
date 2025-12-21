import { writable, derived } from 'svelte/store';
import type { Ingredient } from './ingredientsStore';

export interface CurrentRecipe {
	id: string;
	title: string;
	description: string;
	notes: string;
	ingredients: Ingredient[];
	isPublic: boolean;
	viewMode: boolean;
}

const initialRecipe: CurrentRecipe = {
	id: '',
	title: 'Neapolitan Pizza',
	description: 'Default recipe',
	notes: '',
	ingredients: [
		{ id: 1, name: 'Flour', isFlour: true, amount: 1000, percentage: 100 },
		{ id: 2, name: 'Water', isFlour: false, amount: 600, percentage: 60 },
		{ id: 3, name: 'Salt', isFlour: false, amount: 30, percentage: 3 },
		{ id: 4, name: 'Yeast', isFlour: false, amount: 2, percentage: 0.2 }
	],
	isPublic: false,
	viewMode: false
};

// Main recipe store
function createCurrentRecipeStore() {
	const { subscribe, set, update } = writable<CurrentRecipe>(initialRecipe);

	// ID counter for new ingredients
	let nextId = 5;

	return {
		subscribe,
		set,
		update,

		// Recipe-level methods
		setTitle: (title: string) => update((recipe) => ({ ...recipe, title })),
		setDescription: (description: string) => update((recipe) => ({ ...recipe, description })),
		setNotes: (notes: string) => update((recipe) => ({ ...recipe, notes })),
		toggleViewMode: () => update((recipe) => ({ ...recipe, viewMode: !recipe.viewMode })),

		// Ingredient methods (migrated from ingredientsStore)
		setIngredients: (ingredients: Ingredient[]) => update((recipe) => ({ ...recipe, ingredients })),

		addIngredient: () =>
			update((recipe) => ({
				...recipe,
				ingredients: [
					...recipe.ingredients,
					{
						id: nextId++,
						name: '',
						isFlour: false,
						amount: 0,
						percentage: 0
					}
				]
			})),

		removeIngredient: (id: number) =>
			update((recipe) => ({
				...recipe,
				ingredients: recipe.ingredients.filter((ing) => ing.id !== id)
			})),

		updateIngredient: (id: number, updates: Partial<Ingredient>) =>
			update((recipe) => ({
				...recipe,
				ingredients: recipe.ingredients.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing))
			})),

		toggleIngredientFlour: (id: number) =>
			update((recipe) => {
				// 1. Update the toggled ingredient's status first
				const statusUpdatedIngredients = recipe.ingredients.map((ing) =>
					ing.id === id ? { ...ing, isFlour: !ing.isFlour } : ing
				);

				// 2. Calculate the NEW total flour weight
				const newFlourTotal = statusUpdatedIngredients
					.filter((ing) => ing.isFlour)
					.reduce((sum, ing) => sum + ing.amount, 0);

				// 3. Recalculate amounts/percentages
				const recalculatedIngredients = statusUpdatedIngredients.map((ing) => {
					if (ing.isFlour) {
						// For flour (including the newly toggled one), amount stays, percentage is reset/calc in UI
						return { ...ing, percentage: 100 };
					} else {
						// For non-flour ingredients:
						if (ing.id === id) {
							// If this IS the toggled ingredient (was flour, now isn't), amount stays, calc new percentage
							return {
								...ing,
								percentage: newFlourTotal > 0 ? (ing.amount / newFlourTotal) * 100 : 0
							};
						} else {
							// For OTHER non-flour ingredients, preserve PERCENTAGE, calc new AMOUNT
							return {
								...ing,
								amount: (newFlourTotal * ing.percentage) / 100
							};
						}
					}
				});

				return {
					...recipe,
					ingredients: recalculatedIngredients
				};
			}),

		updateIngredientName: (id: number, name: string) =>
			update((recipe) => ({
				...recipe,
				ingredients: recipe.ingredients.map((ing) => (ing.id === id ? { ...ing, name } : ing))
			})),

		updateIngredientPercentage: (id: number, percentage: number) =>
			update((recipe) => {
				const flourTotal = recipe.ingredients
					.filter((ing) => ing.isFlour)
					.reduce((sum, ing) => sum + ing.amount, 0);

				const newAmount = flourTotal > 0 ? (percentage / 100) * flourTotal : 0;

				return {
					...recipe,
					ingredients: recipe.ingredients.map((ing) =>
						ing.id === id ? { ...ing, percentage, amount: newAmount } : ing
					)
				};
			}),

		updateIngredientAmount: (id: number, amount: number) =>
			update((recipe) => {
				const updatedIngredients = recipe.ingredients.map((ing) =>
					ing.id === id ? { ...ing, amount } : ing
				);

				const updatedIngredient = recipe.ingredients.find((ing) => ing.id === id);

				const flourTotal = updatedIngredients
					.filter((ing) => ing.isFlour)
					.reduce((sum, ing) => sum + ing.amount, 0);

				// si l'ingredient mis a jour est de la farine alors on recalcul la quantité des autres ingrédients
				const recalculatedIngredients = updatedIngredients.map((ing) => {
					if (updatedIngredient?.isFlour) {
						return {
							...ing,
							amount: ing.isFlour
								? ing.amount
								: flourTotal > 0
									? (flourTotal * ing.percentage) / 100
									: 0
						};
					} else {
						// Sinon on recalcul le pourcentage de l'ingredient mis à jour
						return {
							...ing,
							percentage: ing.isFlour ? 100 : flourTotal > 0 ? (ing.amount / flourTotal) * 100 : 0
						};
					}
				});

				return {
					...recipe,
					ingredients: recalculatedIngredients
				};
			}),

		reorderIngredients: (draggedId: number, targetId: number) =>
			update((recipe) => {
				const ingredients = [...recipe.ingredients];
				const draggedIndex = ingredients.findIndex((ing) => ing.id === draggedId);
				const targetIndex = ingredients.findIndex((ing) => ing.id === targetId);

				if (draggedIndex === -1 || targetIndex === -1) return recipe;

				const [draggedItem] = ingredients.splice(draggedIndex, 1);
				ingredients.splice(targetIndex, 0, draggedItem);

				return { ...recipe, ingredients };
			}),

		setTotalWeight: (newTotal: number) =>
			update((recipe) => {
				const currentTotal = recipe.ingredients.reduce((sum, ing) => sum + ing.amount, 0);
				if (currentTotal === 0 || newTotal < 0) return recipe;

				const ratio = newTotal / currentTotal;

				const scaledIngredients = recipe.ingredients.map((ing) => ({
					...ing,
					amount: Math.round(ing.amount * ratio * 10) / 10
				}));

				return {
					...recipe,
					ingredients: scaledIngredients
				};
			}),

		// Utility methods
		setNextId: (id: number) => {
			nextId = id;
		},

		// Reset to initial state
		reset: () => {
			set(initialRecipe);
			nextId = 1;
		}
	};
}

export const currentRecipeStore = createCurrentRecipeStore();

// Derived stores for convenience (reactive computed values)
export const currentIngredients = derived(currentRecipeStore, ($recipe) => $recipe.ingredients);

export const currentNotes = derived(currentRecipeStore, ($recipe) => $recipe.notes);

export const currentTitle = derived(currentRecipeStore, ($recipe) => $recipe.title);

export const flourCount = derived(
	currentRecipeStore,
	($recipe) => $recipe.ingredients.filter((ing) => ing.isFlour).length
);

export const totalWeight = derived(currentRecipeStore, ($recipe) =>
	$recipe.ingredients.reduce((sum, ing) => sum + ing.amount, 0)
);
