<script lang="ts">
	import { recipesStore } from '$lib/stores/recipesStore';
	import { currentNotes } from '$lib/stores/currentRecipeStore';
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
				$currentNotes.trim(),
				ingredients,
				isPublic
			);

			console.log('Save result:', result);

			if (result.success) {
				closeModal();
			} else {
				error =
					result.error instanceof Error
						? result.error.message
						: 'Failed to save recipe. Please try again.';
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
	<div class="fixed inset-0 z-50">
		<!-- Black overlay -->
		<div
			class="fixed inset-0 bg-black opacity-50"
			onclick={closeModal}
			onkeydown={(e) => e.key === 'Enter' && closeModal()}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		></div>

		<!-- Modal content -->
		<div
			class="pointer-events-none fixed inset-0 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="save-modal-title"
		>
			<div class="pointer-events-auto relative w-full max-w-md border-2 border-black bg-white p-6">
				<div class="mb-6">
					<h2 id="save-modal-title" class="text-2xl font-bold text-gray-900">Save Recipe</h2>
					<p class="mt-2 text-sm text-gray-600">Save your current recipe to access it later</p>
				</div>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSave();
					}}
					class="space-y-4"
				>
					<div>
						<label for="title" class="mb-1 block text-sm font-medium text-gray-700">
							Recipe Title *
						</label>
						<input
							id="title"
							type="text"
							bind:value={title}
							required
							class="w-full border-2 border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
							placeholder="My Amazing Bread Recipe"
						/>
					</div>

					<div>
						<label for="description" class="mb-1 block text-sm font-medium text-gray-700">
							Description (optional)
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="3"
							class="w-full border-2 border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
							placeholder="A delicious bread recipe perfect for..."
						></textarea>
					</div>

					<div>
						<label class="flex items-center">
							<input
								type="checkbox"
								bind:checked={isPublic}
								class="h-4 w-4 border-2 border-black text-black focus:ring-2 focus:ring-gray-500"
							/>
							<span class="ml-2 text-sm text-gray-700">
								Make recipe public (others can view it)
							</span>
						</label>
					</div>

					<!-- Recipe Preview -->
					<div class="border-2 border-gray-300 bg-gray-100 p-3">
						<h4 class="mb-2 text-sm font-medium text-black">Recipe Preview:</h4>
						<div class="space-y-1 text-sm text-gray-600">
							<p>{ingredients.length} ingredients</p>
							<p>
								{ingredients.reduce((sum, ing) => sum + ing.amount, 0).toFixed(0)}g total weight
							</p>
							<div class="text-xs text-gray-500">
								{ingredients
									.slice(0, 3)
									.map((ing) => ing.name)
									.join(', ')}
								{ingredients.length > 3 ? `, +${ingredients.length - 3} more` : ''}
							</div>
						</div>
					</div>

					{#if error}
						<div class="border-2 border-black bg-white p-3 text-sm text-black">
							{error}
						</div>
					{/if}

					<div class="flex space-x-3">
						<button
							type="button"
							onclick={closeModal}
							class="flex-1 border-2 border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							class="flex-1 border-2 border-black bg-black px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-black focus:ring-2 focus:ring-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading ? 'Saving...' : 'Save Recipe'}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
