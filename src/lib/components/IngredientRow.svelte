<script lang="ts">
	import type { Ingredient } from '../stores/ingredientsStore';
	import { currentRecipeStore } from '../stores/currentRecipeStore';
	import { dragDropStore } from '../stores/dragDropStore';

	export let ingredient: Ingredient;
	export let flourCount: number;

	$: isDragged = $dragDropStore.draggedId === ingredient.id;
	$: isDragOver = $dragDropStore.dragOverId === ingredient.id;

	function handleDragStart(e: DragEvent): void {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/html', ingredient.id.toString());
		}
		dragDropStore.startDrag(ingredient.id);
	}

	function handleDragOver(e: DragEvent): void {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		dragDropStore.setDragOver(ingredient.id);
	}

	function handleDragLeave(): void {
		dragDropStore.clearDragOver();
	}

	function handleDrop(e: DragEvent): void {
		e.preventDefault();

		const draggedId = $dragDropStore.draggedId;
		if (draggedId === null || draggedId === ingredient.id) {
			dragDropStore.reset();
			return;
		}

		currentRecipeStore.reorderIngredients(draggedId, ingredient.id);
		dragDropStore.endDrag();
	}

	function handleDragEnd(): void {
		dragDropStore.endDrag();
	}
</script>

<tr
	draggable="true"
	class="ingredient-row {isDragged ? 'ingredient-row--dragged' : ''} {isDragOver
		? 'ingredient-row--drag-over'
		: ''}"
	on:dragstart={handleDragStart}
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:dragend={handleDragEnd}
>
	<!-- Drag Handle & Ingredient Name -->
	<td class="ingredient-cell">
		<div class="flex items-center">
			<div class="drag-handle">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="drag-handle-icon"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 8h16M4 16h16"
					/>
				</svg>
			</div>
			<div class="flex flex-1 items-center gap-2">
				<input
					type="text"
					class="ingredient-input flex-1"
					value={ingredient.name}
					placeholder="Ingredient name"
					on:input={(e) =>
						currentRecipeStore.updateIngredientName(
							ingredient.id,
							(e.target as HTMLInputElement).value
						)}
					aria-label="Ingredient name"
				/>
				<!-- Inline Flour Badge Toggle -->
				<button
					type="button"
					class="flour-badge-toggle {ingredient.isFlour
						? flourCount === 1
							? 'flour-badge-toggle--disabled'
							: 'flour-badge-toggle--active'
						: 'flour-badge-toggle--inactive'}"
					disabled={ingredient.isFlour && flourCount === 1}
					on:click|stopPropagation={() =>
						!(ingredient.isFlour && flourCount === 1) &&
						currentRecipeStore.toggleIngredientFlour(ingredient.id)}
					aria-label={ingredient.isFlour && flourCount === 1
						? 'Cannot remove - at least one flour base is required'
						: ingredient.isFlour
							? `Remove ${ingredient.name} as flour base`
							: `Set ${ingredient.name || 'ingredient'} as flour base`}
					title={ingredient.isFlour ? 'Flour Base' : 'Click to make flour base'}
				>
					F
				</button>
			</div>
		</div>
	</td>

	<!-- Amount Input/Display -->
	<td class="ingredient-cell--right">
		<div class="relative">
			<input
				type="number"
				class="amount-input {ingredient.isFlour ? 'amount-input--flour' : ''}"
				value={ingredient.amount}
				on:input={(e) =>
					currentRecipeStore.updateIngredientAmount(
						ingredient.id,
						parseFloat((e.target as HTMLInputElement).value) || 0
					)}
				min="0"
				step="0.1"
				aria-label={`${ingredient.name || 'Ingredient'} amount in grams`}
			/>
			<span class="input-unit-label">g</span>
		</div>
	</td>

	<!-- Percentage Input -->
	<td class="ingredient-cell--right">
		{#if !ingredient.isFlour}
			<div class="percentage-input-container">
				<input
					type="number"
					class="percentage-input"
					value={ingredient.percentage}
					on:input={(e) =>
						currentRecipeStore.updateIngredientPercentage(
							ingredient.id,
							parseFloat((e.target as HTMLInputElement).value) || 0
						)}
					min="0"
					step="0.1"
					aria-label={`${ingredient.name || 'Ingredient'} percentage`}
				/>
				<span
					class="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 transform text-sm text-gray-600"
					>%</span
				>
			</div>
		{:else}
			<div class="flour-percentage-badge">100%</div>
		{/if}
	</td>

	<!-- Remove Button -->
	<td class="ingredient-cell--right">
		<button
			type="button"
			on:click|stopPropagation={() => currentRecipeStore.removeIngredient(ingredient.id)}
			class="remove-button"
			aria-label={`Remove ${ingredient.name || 'ingredient'}`}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="remove-icon"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
				/>
			</svg>
		</button>
	</td>
</tr>
