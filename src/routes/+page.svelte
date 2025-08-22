<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ingredientsStore } from '$lib/stores/ingredientsStore';
	import { decodeHashToRecipe, updateUrlHash } from '$lib/utils/urlEncoding';
	import IngredientTable from '$lib/components/IngredientTable.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import TotalWeight from '$lib/components/TotalWeight.svelte';
	import HelpSection from '$lib/components/HelpSection.svelte';

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

<div class="min-h-screen px-4 py-8">
	<div class="mx-auto max-w-4xl">
		<div class="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-xl">
			<header class="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 text-white">
				<h1 class="text-center text-3xl font-bold">Baker's Percentage Calculator</h1>
				<p class="mt-2 text-center text-amber-100">Calculate perfect bread ratios with ease</p>
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
