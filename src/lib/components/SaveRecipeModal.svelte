<script lang="ts">
	import { recipesStore } from '$lib/stores/recipesStore';
	import type { Ingredient } from '$lib/stores/ingredientsStore';

	export let isOpen = false;
	export let ingredients: Ingredient[] = [];
	export let onClose: (() => void) | undefined = undefined;

	let title = '';
	let description = '';
	let isPublic = false;
	let loading = false;
	let error = '';

	function closeModal() {
		isOpen = false;
		onClose?.();
		resetForm();
	}

	function resetForm() {
		title = '';
		description = '';
		isPublic = false;
		loading = false;
		error = '';
	}

	async function handleSave() {
		if (!title.trim()) {
			error = 'Recipe title is required';
			return;
		}

		if (ingredients.length === 0) {
			error = 'Recipe must have at least one ingredient';
			return;
		}

		loading = true;
		error = '';

		try {
			const result = await recipesStore.saveRecipe(
				title.trim(),
				description.trim(),
				ingredients,
				isPublic
			);

			console.log('Save result:', result);

			if (result.success) {
				closeModal();
			} else {
				error = result.error instanceof Error ? result.error.message : 'Failed to save recipe. Please try again.';
				console.error('Save failed with result:', result);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
			console.error('Save recipe error:', err);
		} finally {
			loading = false;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if isOpen}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black opacity-50 p-4"
		on:click|self={closeModal}
		on:keydown={(e) => e.key === 'Enter' && closeModal()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="save-modal-title"
		tabindex="-1"
	>
		<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
			<div class="mb-6">
				<h2 id="save-modal-title" class="text-2xl font-bold text-gray-900">
					Save Recipe
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					Save your current recipe to access it later
				</p>
			</div>

			<form on:submit|preventDefault={handleSave} class="space-y-4">
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">
						Recipe Title *
					</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						required
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
						placeholder="My Amazing Bread Recipe"
					/>
				</div>

				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
						Description (optional)
					</label>
					<textarea
						id="description"
						bind:value={description}
						rows="3"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
						placeholder="A delicious bread recipe perfect for..."
					></textarea>
				</div>

				<div>
					<label class="flex items-center">
						<input
							type="checkbox"
							bind:checked={isPublic}
							class="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
						/>
						<span class="ml-2 text-sm text-gray-700">
							Make recipe public (others can view it)
						</span>
					</label>
				</div>

				<!-- Recipe Preview -->
				<div class="bg-gray-50 rounded-lg p-3">
					<h4 class="text-sm font-medium text-gray-700 mb-2">Recipe Preview:</h4>
					<div class="text-sm text-gray-600 space-y-1">
						<p>{ingredients.length} ingredients</p>
						<p>{ingredients.reduce((sum, ing) => sum + ing.amount, 0).toFixed(0)}g total weight</p>
						<div class="text-xs text-gray-500">
							{ingredients.slice(0, 3).map(ing => ing.name).join(', ')}
							{ingredients.length > 3 ? `, +${ingredients.length - 3} more` : ''}
						</div>
					</div>
				</div>

				{#if error}
					<div class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
						{error}
					</div>
				{/if}

				<div class="flex space-x-3">
					<button
						type="button"
						on:click={closeModal}
						class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						class="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Saving...' : 'Save Recipe'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}