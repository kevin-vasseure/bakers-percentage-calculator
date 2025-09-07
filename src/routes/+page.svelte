<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ingredientsStore } from '$lib/stores/ingredientsStore';
	import { decodeHashToRecipe, updateUrlHash } from '$lib/utils/urlEncoding';
	import IngredientTable from '$lib/components/IngredientTable.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import TotalWeight from '$lib/components/TotalWeight.svelte';
	import HelpSection from '$lib/components/HelpSection.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import AuthModal from '$lib/components/AuthModal.svelte';
	import RecipeList from '$lib/components/RecipeList.svelte';
	import SaveRecipeModal from '$lib/components/SaveRecipeModal.svelte';
	import type { Ingredient } from '$lib/stores/ingredientsStore';

	let showAuthModal = false;
	let authMode: 'signin' | 'signup' = 'signin';
	let showSaveModal = false;
	let showRecipeList = false;

	function handleOpenAuth(event: { mode: 'signin' | 'signup' }) {
		authMode = event.mode;
		showAuthModal = true;
	}

	function handleLoadRecipe(ingredients: Ingredient[]) {
		// Convert from database format to our ingredient format
		const convertedIngredients = ingredients.map((ing) => ({
			...ing,
			isFlour: ing.isFlour,
			amount: Number(ing.amount) || 0,
			percentage: Number(ing.percentage) || 0,
			isEditing: false
		}));

		ingredientsStore.set(convertedIngredients);
		ingredientsStore.setNextId(Math.max(...convertedIngredients.map((ing) => ing.id)) + 1);
	}

	function toggleRecipeList() {
		showRecipeList = !showRecipeList;
	}

	function handleSaveRecipe() {
		showSaveModal = true;
	}

	// Initialize from URL on mount
	onMount(() => {
		if (!browser) return;

		const hash = window.location.hash.slice(1);
		if (hash) {
			const decodedRecipe = decodeHashToRecipe(hash);
			if (decodedRecipe && decodedRecipe.length > 0) {
				ingredientsStore.set(decodedRecipe);
				ingredientsStore.setNextId(Math.max(...decodedRecipe.map((ing) => ing.id)) + 1);
			}
		}
	});

	// Update URL hash when ingredients change (but not when editing)
	$: if (browser && $ingredientsStore.length > 0) {
		const hasEditingIngredient = $ingredientsStore.some((ing) => ing.isEditing);
		if (!hasEditingIngredient) {
			setTimeout(() => updateUrlHash($ingredientsStore), 100);
		}
	}
</script>

<!-- Main Content -->
<div class="page-container">
	<div class="content-wrapper">
		<div class="mx-auto max-w-4xl">
			<div class="main-card">
				<header class="header-section">
					<div class="flex items-center justify-center">
						<div>
							<h1 class="app-title">Baker's Percentage Calculator</h1>
							<p class="app-subtitle">Calculate perfect bread ratios with ease</p>
						</div>
					</div>
				</header>

				<IngredientTable />

				<!-- Add Ingredient Button -->
				<div class="add-ingredient-section">
					<div class="button-group">
						<button
							type="button"
							on:click={() => ingredientsStore.add()}
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

						<ShareButton />
					</div>
				</div>

				<TotalWeight />
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
			on:click={() => (showRecipeList = false)}
			on:keydown={(e) => e.key === 'Enter' && (showRecipeList = false)}
			role="button"
			tabindex="0"
			aria-label="Close recipe list"
		></div>

		<!-- Slide-up Panel -->
		<div class="slide-up-panel">
			<div class="panel-content">
				<RecipeList
					onLoadRecipe={handleLoadRecipe}
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
<SaveRecipeModal bind:isOpen={showSaveModal} ingredients={$ingredientsStore} />
