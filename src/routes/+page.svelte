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
	import { authStore } from '$lib/stores/authStore';

	let showAuthModal = false;
	let authMode: 'signin' | 'signup' = 'signin';
	let showSaveModal = false;
	let showRecipeList = false;

	function handleOpenAuth(event: { mode: 'signin' | 'signup' }) {
		authMode = event.mode;
		showAuthModal = true;
	}


	function handleLoadRecipe(ingredients: any[]) {
		// Convert from database format to our ingredient format
		const convertedIngredients = ingredients.map(ing => ({
			...ing,
			isFlour: ing.is_flour || ing.isFlour,
			amount: Number(ing.amount) || 0,
			percentage: Number(ing.percentage) || 0,
			isEditing: false
		}));
		
		ingredientsStore.set(convertedIngredients);
		ingredientsStore.setNextId(Math.max(...convertedIngredients.map(ing => ing.id)) + 1);
	}

	function toggleRecipeList() {
		showRecipeList = !showRecipeList;
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
<div class="min-h-screen">
	<div class="px-4 py-8 pb-20">
		<div class="mx-auto max-w-4xl">
			<div class="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-xl">
				<header class="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 text-white">
					<div class="flex items-center justify-center">
						<div>
							<h1 class="text-center text-3xl font-bold">Baker's Percentage Calculator</h1>
							<p class="mt-2 text-center text-amber-100">Calculate perfect bread ratios with ease</p>
						</div>
					</div>
				</header>

			<IngredientTable />

			<!-- Add Ingredient Button -->
			<div class="bg-amber-25 border-t border-amber-100 px-8 py-6">
				<div class="space-y-4">
					<button
						type="button"
						on:click={() => ingredientsStore.add()}
						class="flex w-full transform items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-amber-600 hover:to-orange-600 focus:ring-4 focus:ring-amber-300 focus:outline-none active:scale-[0.98]"
						aria-label="Add new ingredient"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-5 w-5"
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
<BottomBar 
	onOpenAuth={handleOpenAuth}
	onOpenRecipes={toggleRecipeList}
/>

<!-- Recipe List Slide-up Overlay -->
{#if showRecipeList}
	<div class="fixed inset-0 z-50">
		<!-- Overlay -->
		<div 
			class="fixed inset-0 bg-black opacity-50 transition-opacity duration-300"
			on:click={() => showRecipeList = false}
			on:keydown={(e) => e.key === 'Enter' && (showRecipeList = false)}
			role="button"
			tabindex="0"
			aria-label="Close recipe list"
		></div>
		
		<!-- Slide-up Panel -->
		<div class="fixed inset-x-0 bottom-0 h-3/4 max-h-96 transform transition-transform duration-300 ease-out">
			<div class="h-full bg-white rounded-t-2xl shadow-2xl">
				<RecipeList 
					onLoadRecipe={handleLoadRecipe} 
					onClose={() => showRecipeList = false}
					isMobile={true}
				/>
			</div>
		</div>
	</div>
{/if}

<!-- Modals -->
<AuthModal bind:isOpen={showAuthModal} mode={authMode} />
<SaveRecipeModal bind:isOpen={showSaveModal} ingredients={$ingredientsStore} />
