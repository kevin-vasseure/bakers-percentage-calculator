import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Ingredient } from './ingredientsStore';
import { calculateTotalWeight } from '$lib/utils/calculations';

const STORAGE_KEY = 'bakers-recipes';

export interface RecipeWithIngredients {
	id: string;
	title: string;
	description: string | null;
	notes: string | null;
	is_public: boolean | null;
	total_weight: number | null;
	created_at: string | null;
	updated_at: string | null;
	ingredients: Ingredient[];
}

export interface RecipesState {
	recipes: RecipeWithIngredients[];
	loading: boolean;
	error: string | null;
	selectedRecipeId: string | null;
}

const initialState: RecipesState = {
	recipes: [],
	loading: false,
	error: null,
	selectedRecipeId: null
};

function generateId(): string {
	if (browser && typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readStorage(): RecipeWithIngredients[] {
	if (!browser) return [];

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as RecipeWithIngredients[]) : [];
	} catch (error) {
		console.error('Error reading recipes from localStorage:', error);
		return [];
	}
}

function writeStorage(recipes: RecipeWithIngredients[]): void {
	if (!browser) return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
	} catch (error) {
		console.error('Error writing recipes to localStorage:', error);
	}
}

function createRecipesStore() {
	const { subscribe, set, update } = writable<RecipesState>(initialState);

	const loadRecipes = async () => {
		update((state) => ({ ...state, loading: true, error: null }));

		try {
			const recipes = readStorage().sort((a, b) =>
				(b.updated_at || '').localeCompare(a.updated_at || '')
			);

			update((state) => ({
				...state,
				recipes,
				loading: false
			}));
		} catch (error) {
			console.error('Error loading recipes:', error);
			update((state) => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to load recipes'
			}));
		}
	};

	const saveRecipe = async (
		title: string,
		description: string,
		notes: string,
		ingredients: Ingredient[],
		isPublic: boolean = false
	) => {
		update((state) => ({ ...state, loading: true, error: null }));

		try {
			const now = new Date().toISOString();
			const recipe: RecipeWithIngredients = {
				id: generateId(),
				title,
				description,
				notes,
				is_public: isPublic,
				total_weight: Math.round(calculateTotalWeight(ingredients)),
				created_at: now,
				updated_at: now,
				ingredients: ingredients.map((ing) => ({ ...ing }))
			};

			const recipes = [recipe, ...readStorage()];
			writeStorage(recipes);

			await loadRecipes();

			return { success: true, recipe };
		} catch (error) {
			console.error('Error saving recipe:', error);
			update((state) => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to save recipe'
			}));
			return { success: false, error };
		}
	};

	const updateRecipe = async (
		recipeId: string,
		updates: {
			title?: string;
			description?: string;
			notes?: string;
			ingredients?: Ingredient[];
			isPublic?: boolean;
		}
	) => {
		update((state) => ({ ...state, loading: true, error: null }));

		try {
			const recipes = readStorage();
			const index = recipes.findIndex((r) => r.id === recipeId);

			if (index === -1) {
				throw new Error('Recipe not found');
			}

			const existing = recipes[index];
			const updated: RecipeWithIngredients = {
				...existing,
				title: updates.title ?? existing.title,
				description: updates.description ?? existing.description,
				notes: updates.notes ?? existing.notes,
				is_public: updates.isPublic ?? existing.is_public,
				ingredients: updates.ingredients
					? updates.ingredients.map((ing) => ({ ...ing }))
					: existing.ingredients,
				total_weight: updates.ingredients
					? Math.round(calculateTotalWeight(updates.ingredients))
					: existing.total_weight,
				updated_at: new Date().toISOString()
			};

			recipes[index] = updated;
			writeStorage(recipes);

			await loadRecipes();

			return { success: true };
		} catch (error) {
			console.error('Error updating recipe:', error);
			update((state) => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to update recipe'
			}));
			return { success: false, error };
		}
	};

	const deleteRecipe = async (recipeId: string) => {
		update((state) => ({ ...state, loading: true, error: null }));

		try {
			const recipes = readStorage().filter((r) => r.id !== recipeId);
			writeStorage(recipes);

			update((state) => ({
				...state,
				recipes: state.recipes.filter((r) => r.id !== recipeId),
				loading: false,
				selectedRecipeId: state.selectedRecipeId === recipeId ? null : state.selectedRecipeId
			}));

			return { success: true };
		} catch (error) {
			console.error('Error deleting recipe:', error);
			update((state) => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to delete recipe'
			}));
			return { success: false, error };
		}
	};

	const selectRecipe = (recipeId: string | null) => {
		update((state) => ({ ...state, selectedRecipeId: recipeId }));
	};

	const clearError = () => {
		update((state) => ({ ...state, error: null }));
	};

	const reset = () => {
		set(initialState);
	};

	return {
		subscribe,
		loadRecipes,
		saveRecipe,
		updateRecipe,
		deleteRecipe,
		selectRecipe,
		clearError,
		reset
	};
}

export const recipesStore = createRecipesStore();

// Load saved recipes from localStorage on startup (client only)
if (browser) {
	recipesStore.loadRecipes();
}
