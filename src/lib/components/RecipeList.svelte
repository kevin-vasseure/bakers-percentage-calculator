<script lang="ts">
	import { recipesStore } from '$lib/stores/recipesStore';
	import { authStore } from '$lib/stores/authStore';
	import { currentRecipeStore } from '$lib/stores/currentRecipeStore';
	import type { RecipeWithIngredients } from '$lib/stores/recipesStore';
	import type { CurrentRecipe } from '$lib/stores/currentRecipeStore';

	interface Props {
		onLoadRecipe?: ((recipe: RecipeWithIngredients) => void) | undefined;
		onUpdateRecipe?: ((recipe: CurrentRecipe) => void) | undefined;
		onClose?: (() => void) | undefined;
		onSaveRecipe?: (() => void) | undefined;
		isMobile?: boolean;
	}

	let { onLoadRecipe, onUpdateRecipe, onClose, onSaveRecipe, isMobile = false }: Props = $props();

	let recipes = $derived($recipesStore.recipes);
	let loading = $derived($recipesStore.loading);
	let error = $derived($recipesStore.error);
	let user = $derived($authStore.user);
	let currentRecipe = $derived($currentRecipeStore);

	// Check if current recipe matches a saved recipe and has changes
	let canUpdateRecipe = $derived(() => {
		return (
			currentRecipe.id &&
			currentRecipe.title.trim() !== '' &&
			recipes.some((r) => r.id === currentRecipe.id)
		);
	});

	function loadRecipe(recipe: RecipeWithIngredients) {
		if (recipe && onLoadRecipe) {
			onLoadRecipe(recipe);
			if (isMobile && onClose) {
				onClose();
			}
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	async function deleteRecipe(recipeId: string, recipeName: string) {
		if (confirm(`Are you sure you want to delete "${recipeName}"?`)) {
			await recipesStore.deleteRecipe(recipeId);
		}
	}

	function updateCurrentRecipe() {
		if (currentRecipe.id && onUpdateRecipe) {
			onUpdateRecipe(currentRecipe);
		}
	}
</script>

<div class="flex h-full flex-col border-r-2 border-black bg-white">
	<!-- Header -->
	<div class="flex items-center justify-between border-b-2 border-black bg-gray-100 p-4">
		<h2 class="text-lg font-semibold text-black">My Recipes</h2>
		{#if isMobile}
			<button
				type="button"
				onclick={() => onClose?.()}
				class="p-2 text-gray-400 hover:bg-gray-200 hover:text-black"
				aria-label="Close recipe list"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	</div>

	<!-- Save Recipe Button -->
	{#if user && onSaveRecipe}
		<div class="border-b-2 border-black bg-white p-4">
			<div
				class={canUpdateRecipe()
					? 'flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2'
					: ''}
			>
				<button
					type="button"
					onclick={() => onSaveRecipe?.()}
					class="{canUpdateRecipe()
						? 'w-full md:w-1/2'
						: 'w-full'} border-2 border-black bg-black px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black focus:ring-2 focus:ring-black focus:outline-none"
				>
					{#if canUpdateRecipe()}
						Save As New Recipe
					{:else}
						Save Current Recipe
					{/if}
				</button>
				<!-- Update Recipe Button -->
				{#if canUpdateRecipe()}
					<button
						type="button"
						onclick={() => updateCurrentRecipe()}
						class="w-full border-2 border-yellow-500 bg-yellow-500 px-4 py-2 font-semibold text-black transition-colors duration-200 hover:bg-white hover:text-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none md:w-1/2"
					>
						Update "{currentRecipe.title}"
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Content -->
	<div class="flex-1 overflow-y-auto">
		{#if !user}
			<div class="p-4 text-center text-gray-500">
				<p>Sign in to see your saved recipes</p>
			</div>
		{:else if loading}
			<div class="space-y-3 p-4">
				{#each Array(3)}
					<div class="animate-pulse">
						<div class="mb-2 h-4 w-3/4 bg-gray-200"></div>
						<div class="h-3 w-1/2 bg-gray-200"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="p-4">
				<div class="border-2 border-black bg-white p-3">
					<p class="text-sm text-black">{error}</p>
					<button
						type="button"
						onclick={() => recipesStore.clearError()}
						class="mt-2 text-xs text-black underline hover:text-gray-600"
					>
						Dismiss
					</button>
				</div>
			</div>
		{:else if recipes.length === 0}
			<div class="p-4 text-center text-gray-500">
				<svg
					class="mx-auto mb-3 h-12 w-12 text-gray-300"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<p class="mb-2 text-sm">No recipes yet</p>
				<p class="text-xs text-gray-400">Save your first recipe to see it here</p>
			</div>
		{:else}
			<div class="divide-y divide-gray-300">
				{#each recipes as recipe (recipe.id)}
					<div class="group transition-colors duration-200 hover:bg-gray-100">
						<div class="p-4">
							<div class="flex items-start justify-between">
								<button
									type="button"
									onclick={() => loadRecipe(recipe)}
									class="flex-1 text-left focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset"
								>
									<h3
										class="font-medium text-gray-900 transition-colors duration-200 group-hover:text-black"
									>
										{recipe.title}
										{#if currentRecipe.id === recipe.id}
											<span class="ml-2 text-xs font-normal text-yellow-600"
												>(currently editing)</span
											>
										{/if}
									</h3>
									{#if recipe.description}
										<p class="mt-1 line-clamp-2 text-sm text-gray-500">
											{recipe.description}
										</p>
									{/if}
									<div class="mt-2 flex items-center space-x-4 text-xs text-gray-400">
										<span>{recipe.ingredients?.length || 0} ingredients</span>
										<span>{recipe.total_weight}g total</span>
										<span>{formatDate(recipe.updated_at || recipe.created_at || '')}</span>
									</div>
								</button>

								<div
									class="ml-2 flex items-center space-x-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
								>
									{#if recipe.is_public}
										<div class="p-1 text-black" title="Public recipe">
											<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
												/>
											</svg>
										</div>
									{:else}
										<div class="p-1 text-gray-400" title="Private recipe">
											<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
												/>
											</svg>
										</div>
									{/if}

									<button
										type="button"
										onclick={(e) => {
											e.stopPropagation();
											deleteRecipe(recipe.id, recipe.title);
										}}
										class="p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-200 hover:text-black"
										title="Delete recipe"
										aria-label="Delete recipe"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
