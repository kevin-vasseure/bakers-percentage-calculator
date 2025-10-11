import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { authStore } from './authStore';
import type { Ingredient } from './ingredientsStore';
import { calculateTotalWeight } from '$lib/utils/calculations';
import type { Database } from '$lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type Recipe = Database['public']['Tables']['recipes']['Row'];
type RecipeInsert = Database['public']['Tables']['recipes']['Insert'];
type RecipeUpdate = Database['public']['Tables']['recipes']['Update'];

export interface RecipeWithIngredients extends Recipe {
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

function createRecipesStore() {
	const { subscribe, set, update } = writable<RecipesState>(initialState);

	const loadRecipes = async () => {
		update((state) => ({ ...state, loading: true, error: null }));

		try {
			// Get current user
			const {
				data: { user },
				error: userError
			} = await supabase.auth.getUser();
			if (userError || !user) {
				throw new Error('User not authenticated');
			}

			const { data: recipes, error: recipesError } = await supabase
				.from('recipes')
				.select(
					`
					*,
					ingredients (
						id,
						name,
						is_flour,
						amount,
						percentage,
						sort_order
					)
				`
				)
				.eq('user_id', user.id)
				.order('updated_at', { ascending: false });

			if (recipesError) throw recipesError;

			type RecipeWithIngredientsQuery = Recipe & {
				ingredients: Array<{
					id: string;
					name: string;
					is_flour: boolean | null;
					amount: number | null;
					percentage: number | null;
					sort_order: number | null;
				}>;
			};

			const recipesWithIngredients: RecipeWithIngredients[] = (
				(recipes as RecipeWithIngredientsQuery[]) || []
			).map((recipe) => ({
				...recipe,
				ingredients: (recipe.ingredients || [])
					.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
					.map((ing, index) => ({
						id: index + 1, // Convert to our local ID system
						recipe_id: ing.id,
						name: ing.name,
						isFlour: ing.is_flour || false,
						amount: Number(ing.amount) || 0,
						percentage: Number(ing.percentage) || 0
					}))
			}));

			update((state) => ({
				...state,
				recipes: recipesWithIngredients,
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
			const totalWeight = calculateTotalWeight(ingredients);

			// Get current user
			const {
				data: { user },
				error: userError
			} = await supabase.auth.getUser();
			if (userError || !user) {
				throw new Error('User not authenticated');
			}

			// Insert recipe
			const recipeData: RecipeInsert = {
				user_id: user.id,
				title,
				description,
				notes,
				is_public: isPublic,
				total_weight: Math.round(totalWeight)
			};

			const { data: recipe, error: recipeError } = await (supabase as SupabaseClient)
				.from('recipes')
				.insert(recipeData)
				.select()
				.single();

			if (recipeError) throw recipeError;

			// Insert ingredients
			const ingredientsToInsert = ingredients.map((ing, index) => ({
				recipe_id: recipe!.id,
				name: ing.name,
				is_flour: ing.isFlour,
				amount: ing.amount,
				percentage: ing.percentage,
				sort_order: index
			}));

			const { error: ingredientsError } = await (supabase as SupabaseClient)
				.from('ingredients')
				.insert(ingredientsToInsert);

			if (ingredientsError) throw ingredientsError;

			// Try to reload recipes, but don't fail if it doesn't work
			try {
				await loadRecipes();
			} catch (loadError) {
				console.warn('Recipe saved successfully, but failed to reload recipe list:', loadError);
				// Continue - don't fail the save operation
			}

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
			const recipeUpdates: RecipeUpdate = {};

			if (updates.title !== undefined) recipeUpdates.title = updates.title;
			if (updates.description !== undefined) recipeUpdates.description = updates.description;
			if (updates.notes !== undefined) recipeUpdates.notes = updates.notes;
			if (updates.isPublic !== undefined) recipeUpdates.is_public = updates.isPublic;

			if (updates.ingredients) {
				recipeUpdates.total_weight = Math.round(calculateTotalWeight(updates.ingredients));
			}

			// Update recipe
			const { error: recipeError } = await (supabase as SupabaseClient)
				.from('recipes')
				.update(recipeUpdates)
				.eq('id', recipeId);

			if (recipeError) throw recipeError;

			// Update ingredients if provided
			if (updates.ingredients) {
				// Delete existing ingredients
				const { error: deleteError } = await supabase
					.from('ingredients')
					.delete()
					.eq('recipe_id', recipeId);

				if (deleteError) throw deleteError;

				// Insert new ingredients
				const ingredientsToInsert = updates.ingredients.map((ing, index) => ({
					recipe_id: recipeId,
					name: ing.name,
					is_flour: ing.isFlour,
					amount: ing.amount,
					percentage: ing.percentage,
					sort_order: index
				}));

				const { error: ingredientsError } = await (supabase as SupabaseClient)
					.from('ingredients')
					.insert(ingredientsToInsert);

				if (ingredientsError) throw ingredientsError;
			}

			// Reload recipes
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
			const { error } = await supabase.from('recipes').delete().eq('id', recipeId);

			if (error) throw error;

			// Remove from local state
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

// Auto-load recipes when user authenticates
authStore.subscribe((auth) => {
	if (auth.user && !auth.loading) {
		recipesStore.loadRecipes();
	} else if (!auth.user) {
		recipesStore.reset();
	}
});
