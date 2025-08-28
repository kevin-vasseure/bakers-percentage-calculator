<script lang="ts">
	import { recipesStore } from '$lib/stores/recipesStore';
	import { authStore } from '$lib/stores/authStore';
	import { ingredientsStore } from '$lib/stores/ingredientsStore';

	export let onLoadRecipe: ((ingredients: any[]) => void) | undefined = undefined;
	export let onClose: (() => void) | undefined = undefined;
	export let onSaveRecipe: (() => void) | undefined = undefined;
	export let isMobile = false;

	$: recipes = $recipesStore.recipes;
	$: loading = $recipesStore.loading;
	$: error = $recipesStore.error;
	$: user = $authStore.user;

	function loadRecipe(recipe: any) {
		if (recipe.ingredients && onLoadRecipe) {
			onLoadRecipe(recipe.ingredients);
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
</script>

<div class="h-full flex flex-col bg-white border-r-2 border-black">
	<!-- Header -->
	<div class="flex items-center justify-between p-4 border-b-2 border-black bg-gray-100">
		<h2 class="text-lg font-semibold text-black">My Recipes</h2>
		{#if isMobile}
			<button
				type="button"
				on:click={() => onClose?.()}
				class="p-2 text-gray-400 hover:text-black hover:bg-gray-200"
				aria-label="Close recipe list"
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Save Recipe Button -->
	{#if user && onSaveRecipe}
		<div class="p-4 border-b-2 border-black bg-white">
			<button
				type="button"
				on:click={() => onSaveRecipe?.()}
				class="w-full bg-black text-white px-4 py-2 border-2 border-black font-semibold transition-colors duration-200 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
			>
				Save Current Recipe
			</button>
		</div>
	{/if}

	<!-- Content -->
	<div class="flex-1 overflow-y-auto">
		{#if !user}
			<div class="p-4 text-center text-gray-500">
				<p>Sign in to see your saved recipes</p>
			</div>
		{:else if loading}
			<div class="p-4 space-y-3">
				{#each Array(3) as _}
					<div class="animate-pulse">
						<div class="h-4 bg-gray-200 w-3/4 mb-2"></div>
						<div class="h-3 bg-gray-200 w-1/2"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="p-4">
				<div class="bg-white border-2 border-black p-3">
					<p class="text-sm text-black">{error}</p>
					<button
						type="button"
						on:click={() => recipesStore.clearError()}
						class="mt-2 text-xs text-black hover:text-gray-600 underline"
					>
						Dismiss
					</button>
				</div>
			</div>
		{:else if recipes.length === 0}
			<div class="p-4 text-center text-gray-500">
				<svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p class="text-sm mb-2">No recipes yet</p>
				<p class="text-xs text-gray-400">Save your first recipe to see it here</p>
			</div>
		{:else}
			<div class="divide-y divide-gray-300">
				{#each recipes as recipe (recipe.id)}
					<div class="group hover:bg-gray-100 transition-colors duration-200">
						<div class="p-4">
							<div class="flex items-start justify-between">
								<button
									type="button"
									on:click={() => loadRecipe(recipe)}
									class="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
								>
									<h3 class="font-medium text-gray-900 group-hover:text-black transition-colors duration-200">
										{recipe.title}
									</h3>
									{#if recipe.description}
										<p class="text-sm text-gray-500 mt-1 line-clamp-2">
											{recipe.description}
										</p>
									{/if}
									<div class="flex items-center mt-2 space-x-4 text-xs text-gray-400">
										<span>{recipe.ingredients?.length || 0} ingredients</span>
										<span>{recipe.total_weight}g total</span>
										<span>{formatDate(recipe.updated_at || recipe.created_at || '')}</span>
									</div>
								</button>

								<div class="ml-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
									{#if recipe.is_public}
										<div class="p-1 text-black" title="Public recipe">
											<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
											</svg>
										</div>
									{:else}
										<div class="p-1 text-gray-400" title="Private recipe">
											<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
										</div>
									{/if}

									<button
										type="button"
										on:click|stopPropagation={() => deleteRecipe(recipe.id, recipe.title)}
										class="p-1 text-gray-400 hover:text-black hover:bg-gray-200 transition-colors duration-200"
										title="Delete recipe"
										aria-label="Delete recipe"
									>
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>