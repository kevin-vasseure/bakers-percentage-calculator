import { writable, derived } from 'svelte/store';
import type { Ingredient } from './ingredientsStore';

export interface CurrentRecipe {
	title: string;
	description: string;
	notes: string;
	ingredients: Ingredient[];
}

const initialRecipe: CurrentRecipe = {
	title: '',
	description: '',
	notes: '',
	ingredients: []
};

// Main recipe store
function createCurrentRecipeStore() {
	const { subscribe, set, update } = writable<CurrentRecipe>(initialRecipe);

	// ID counter for new ingredients
	let nextId = 1;

	return {
		subscribe,
		set,
		update,

		// Recipe-level methods
		setTitle: (title: string) => update(recipe => ({ ...recipe, title })),
		setDescription: (description: string) => update(recipe => ({ ...recipe, description })),
		setNotes: (notes: string) => update(recipe => ({ ...recipe, notes })),

		// Ingredient methods (migrated from ingredientsStore)
		setIngredients: (ingredients: Ingredient[]) => update(recipe => ({ ...recipe, ingredients })),

		addIngredient: () => update(recipe => ({
			...recipe,
			ingredients: [...recipe.ingredients, {
				id: nextId++,
				name: '',
				isFlour: false,
				amount: 0,
				percentage: 0,
				isEditing: true
			}]
		})),

		removeIngredient: (id: number) => update(recipe => ({
			...recipe,
			ingredients: recipe.ingredients.filter(ing => ing.id !== id)
		})),

		updateIngredient: (id: number, updates: Partial<Ingredient>) => update(recipe => ({
			...recipe,
			ingredients: recipe.ingredients.map(ing =>
				ing.id === id ? { ...ing, ...updates } : ing
			)
		})),

		toggleIngredientFlour: (id: number) => update(recipe => ({
			...recipe,
			ingredients: recipe.ingredients.map(ing =>
				ing.id === id ? { ...ing, isFlour: !ing.isFlour } : ing
			)
		})),

		toggleIngredientEdit: (id: number) => update(recipe => ({
			...recipe,
			ingredients: recipe.ingredients.map(ing =>
				ing.id === id ? { ...ing, isEditing: !ing.isEditing } : ing
			)
		})),

		updateIngredientName: (id: number, name: string) => update(recipe => ({
			...recipe,
			ingredients: recipe.ingredients.map(ing =>
				ing.id === id ? { ...ing, name } : ing
			)
		})),

		updateIngredientPercentage: (id: number, percentage: number) => update(recipe => ({
			...recipe,
			ingredients: recipe.ingredients.map(ing =>
				ing.id === id ? { ...ing, percentage } : ing
			)
		})),

		updateIngredientAmount: (id: number, amount: number) => update(recipe => ({
			...recipe,
			ingredients: recipe.ingredients.map(ing =>
				ing.id === id ? { ...ing, amount } : ing
			)
		})),

		reorderIngredients: (draggedId: number, targetId: number) => update(recipe => {
			const ingredients = [...recipe.ingredients];
			const draggedIndex = ingredients.findIndex(ing => ing.id === draggedId);
			const targetIndex = ingredients.findIndex(ing => ing.id === targetId);

			if (draggedIndex === -1 || targetIndex === -1) return recipe;

			const [draggedItem] = ingredients.splice(draggedIndex, 1);
			ingredients.splice(targetIndex, 0, draggedItem);

			return { ...recipe, ingredients };
		}),

		// Utility methods
		setNextId: (id: number) => { nextId = id; },

		// Reset to initial state
		reset: () => {
			set(initialRecipe);
			nextId = 1;
		}
	};
}

export const currentRecipeStore = createCurrentRecipeStore();

// Derived stores for convenience (reactive computed values)
export const currentIngredients = derived(
	currentRecipeStore,
	$recipe => $recipe.ingredients
);

export const currentNotes = derived(
	currentRecipeStore,
	$recipe => $recipe.notes
);

export const currentTitle = derived(
	currentRecipeStore,
	$recipe => $recipe.title
);

export const flourCount = derived(
	currentRecipeStore,
	$recipe => $recipe.ingredients.filter(ing => ing.isFlour).length
);

export const totalWeight = derived(
	currentRecipeStore,
	$recipe => $recipe.ingredients.reduce((sum, ing) => sum + ing.amount, 0)
);

export const hasEditingIngredient = derived(
	currentRecipeStore,
	$recipe => $recipe.ingredients.some(ing => ing.isEditing)
);
