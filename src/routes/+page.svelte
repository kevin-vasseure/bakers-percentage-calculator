<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import {
		currentRecipeStore,
		currentIngredients,
		currentNotes,
		type CurrentRecipe
	} from '$lib/stores/currentRecipeStore';
	import { decodeHashToRecipe, updateUrlHash } from '$lib/utils/urlEncoding';
	import IngredientTable from '$lib/components/IngredientTable.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import TotalWeight from '$lib/components/TotalWeight.svelte';
	import HelpSection from '$lib/components/HelpSection.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import AuthModal from '$lib/components/AuthModal.svelte';
	import RecipeList from '$lib/components/RecipeList.svelte';
	import SaveRecipeModal from '$lib/components/SaveRecipeModal.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import ViewModeToggle from '$lib/components/ViewModeToggle.svelte';
	import { recipesStore, type RecipeWithIngredients } from '$lib/stores/recipesStore';

	let showAuthModal = $state(false);
	let authMode: 'signin' | 'signup' = $state('signin');
	let showSaveModal = $state(false);
	let showRecipeList = $state(false);

	function handleOpenAuth(event: { mode: 'signin' | 'signup' }) {
		authMode = event.mode;
		showAuthModal = true;
	}

	function handleLoadRecipe(recipe: RecipeWithIngredients) {
		// Convert from database format to our ingredient format
		const convertedIngredients = recipe.ingredients.map((ing) => ({
			...ing,
			isFlour: ing.isFlour,
			amount: Number(ing.amount) || 0,
			percentage: Number(ing.percentage) || 0
		}));

		// Update the unified recipe store with all recipe data
		currentRecipeStore.set({
			id: recipe.id,
			title: recipe.title || '',
			description: recipe.description || '',
			notes: recipe.notes || '',
			ingredients: convertedIngredients,
			isPublic: recipe.is_public || false,
			viewMode: true
		});

		currentRecipeStore.setNextId(Math.max(...convertedIngredients.map((ing) => ing.id)) + 1);
	}

	function handleUpdateRecipe(currentRecipe: CurrentRecipe) {
		recipesStore.updateRecipe(currentRecipe.id, currentRecipe);
	}

	function toggleRecipeList() {
		showRecipeList = !showRecipeList;
	}

	function handleSaveRecipe() {
		showSaveModal = true;
	}

	function handleLoadDefault() {
		if (confirm('Load default recipe? This will replace the current recipe.')) {
			currentRecipeStore.reset();
		}
	}

	// Initialize from URL on mount
	onMount(() => {
		if (!browser) return;

		const hash = window.location.hash.slice(1);
		if (hash) {
			const decodedRecipe = decodeHashToRecipe(hash);
			if (decodedRecipe && decodedRecipe.ingredients.length > 0) {
				// Load the recipe data into our unified store
				currentRecipeStore.set(decodedRecipe);
				currentRecipeStore.setNextId(
					Math.max(...decodedRecipe.ingredients.map((ing) => ing.id)) + 1
				);
			}
		}
	});

	// Update URL hash when recipe changes
	$effect(() => {
		if (browser && $currentIngredients.length > 0) {
			setTimeout(() => updateUrlHash($currentRecipeStore), 100);
		}
	});
</script>

<svelte:head>
	{#if $currentRecipeStore}
		<title>{$currentRecipeStore.title}</title>
		<meta name="description" content={$currentRecipeStore.description} />
	{/if}
</svelte:head>

<!-- Main Content -->
<div class="page-container">
	<div class="content-wrapper">
		<div class="mx-auto max-w-4xl">
			<div class="main-card">
				<header class="header-section">
					<div class="flex items-center justify-center">
						<div>
							<h1 class="app-title">Baker's Percentage Calculator: {$currentRecipeStore.title}</h1>
							<p class="app-subtitle">
								{$currentRecipeStore.description === ''
									? 'Calculate perfect dough percentages'
									: $currentRecipeStore.description}
							</p>
						</div>
					</div>
				</header>

				<IngredientTable />

				<!-- Add Ingredient Button -->
				{#if !$currentRecipeStore.viewMode}
					<div class="add-ingredient-section">
						<div class="button-group">
							<button
								type="button"
								onclick={() => currentRecipeStore.addIngredient()}
								class="primary-button"
								aria-label="Add new ingredient"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="button-icon"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4v16m8-8H4"
									/>
								</svg>
								Add New Ingredient
							</button>
							<button
								type="button"
								onclick={handleLoadDefault}
								class="secondary-button"
								aria-label="Load default recipe"
							>
								Load Default Recipe
							</button>
						</div>
					</div>
				{/if}

				<TotalWeight />

				<ShareButton />

				<!-- Recipe Notes Section -->
				<div class="border-t-2 border-black bg-white px-8 py-6">
					<div class="mb-4">
						<h3 class="text-lg font-semibold text-black">Recipe Notes</h3>
						<p class="mt-1 text-sm text-gray-600">
							Add instructions, tips, and notes using markdown formatting
						</p>
					</div>
					<MarkdownEditor
						value={$currentNotes}
						onchange={(value) => currentRecipeStore.setNotes(value)}
						placeholder="## Instructions&#10;1. Mix dry ingredients...&#10;&#10;## Tips&#10;- Keep dough at room temperature&#10;- Score deeply for better rise&#10;&#10;## Notes&#10;This recipe works great with..."
					/>
				</div>
			</div>

			<HelpSection />
		</div>
	</div>
</div>

<!-- Bottom Bar -->
<BottomBar onOpenAuth={handleOpenAuth} onOpenRecipes={toggleRecipeList} />

<!-- Recipe List Slide-up Overlay -->
{#if showRecipeList}
	<div class="modal-overlay">
		<!-- Overlay -->
		<div
			class="modal-backdrop"
			onclick={() => (showRecipeList = false)}
			onkeydown={(e) => e.key === 'Enter' && (showRecipeList = false)}
			role="button"
			tabindex="0"
			aria-label="Close recipe list"
		></div>

		<!-- Slide-up Panel -->
		<div class="slide-up-panel">
			<div class="panel-content">
				<RecipeList
					onLoadRecipe={handleLoadRecipe}
					onUpdateRecipe={handleUpdateRecipe}
					onClose={() => (showRecipeList = false)}
					onSaveRecipe={handleSaveRecipe}
					isMobile={true}
				/>
			</div>
		</div>
	</div>
{/if}

<!-- Modals -->
<AuthModal bind:isOpen={showAuthModal} mode={authMode} />
<SaveRecipeModal bind:isOpen={showSaveModal} ingredients={$currentIngredients} />

<!-- Floating View/Edit Toggle Button -->
<ViewModeToggle />
