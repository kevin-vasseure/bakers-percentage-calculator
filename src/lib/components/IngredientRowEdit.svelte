<script lang="ts">
	import type { Ingredient } from '../stores/ingredientsStore';
	import { currentRecipeStore } from '../stores/currentRecipeStore';
	import { dragDropStore } from '../stores/dragDropStore';
	import EditModal from './EditModal.svelte';

	export let ingredient: Ingredient;
	export let flourCount: number;

	$: isDragged = $dragDropStore.draggedId === ingredient.id;
	$: isDragOver = $dragDropStore.dragOverId === ingredient.id;

	// Modal state
	let modalOpen = false;
	let modalField: 'name' | 'amount' | 'percentage' | null = null;
	let modalValue: string | number = '';
	let modalLabel = '';
	let modalType: 'text' | 'number' = 'text';
	let modalUnit = '';

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

	function openModal(field: 'name' | 'amount' | 'percentage') {
		modalField = field;

		switch (field) {
			case 'name':
				modalValue = ingredient.name;
				modalLabel = 'Edit Ingredient Name';
				modalType = 'text';
				modalUnit = '';
				break;
			case 'amount':
				modalValue = ingredient.amount;
				modalLabel = 'Edit Weight';
				modalType = 'number';
				modalUnit = 'g';
				break;
			case 'percentage':
				modalValue = ingredient.percentage;
				modalLabel = 'Edit Percentage';
				modalType = 'number';
				modalUnit = '%';
				break;
		}

		modalOpen = true;
	}

	function handleModalSave(value: string | number) {
		if (modalField === null) return;

		switch (modalField) {
			case 'name':
				currentRecipeStore.updateIngredientName(ingredient.id, value as string);
				break;
			case 'amount':
				currentRecipeStore.updateIngredientAmount(ingredient.id, parseFloat(value.toString()) || 0);
				break;
			case 'percentage':
				currentRecipeStore.updateIngredientPercentage(
					ingredient.id,
					parseFloat(value.toString()) || 0
				);
				break;
		}
	}

	function handleModalClose() {
		modalOpen = false;
		modalField = null;
	}

	function handleRemove() {
		currentRecipeStore.removeIngredient(ingredient.id);
	}

	function handleToggleFlour() {
		if (!(ingredient.isFlour && flourCount === 1)) {
			currentRecipeStore.toggleIngredientFlour(ingredient.id);
		}
	}
</script>

<tr
	draggable="true"
	class="ingredient-row-edit {isDragged ? 'ingredient-row-edit--dragged' : ''} {isDragOver
		? 'ingredient-row-edit--drag-over'
		: ''}"
	on:dragstart={handleDragStart}
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:dragend={handleDragEnd}
>
	<td class="ingredient-cell-edit">
		<div class="flex items-center gap-2">
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
			<button
				type="button"
				class="ingredient-name-edit editable-field"
				on:click={() => openModal('name')}
			>
				{ingredient.name || 'Tap to edit'}
			</button>
			<button
				type="button"
				class="flour-badge-edit {ingredient.isFlour
					? flourCount === 1
						? 'flour-badge-edit--disabled'
						: 'flour-badge-edit--active'
					: 'flour-badge-edit--inactive'}"
				disabled={ingredient.isFlour && flourCount === 1}
				on:click={handleToggleFlour}
				title={ingredient.isFlour ? 'Flour Base' : 'Click to make flour base'}
			>
				F
			</button>
			<button
				aria-label="remove ingredient"
				type="button"
				class="remove-button-edit"
				on:click={handleRemove}
				title="Remove"
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
		</div>
	</td>
	<td class="ingredient-cell-edit--right">
		<button type="button" class="amount-edit editable-field" on:click={() => openModal('amount')}>
			{ingredient.amount}<span class="unit-edit">g</span>
		</button>
	</td>
	<td class="ingredient-cell-edit--right">
		{#if !ingredient.isFlour}
			<button
				type="button"
				class="percentage-edit editable-field"
				on:click={() => openModal('percentage')}
			>
				{ingredient.percentage.toFixed(1)}%
			</button>
		{:else}
			<span class="percentage-edit-disabled">100%</span>
		{/if}
	</td>
</tr>

<EditModal
	isOpen={modalOpen}
	value={modalValue}
	label={modalLabel}
	type={modalType}
	unit={modalUnit}
	onSave={handleModalSave}
	onClose={handleModalClose}
/>

<style>
	.ingredient-row-edit {
		border-bottom: 1px solid #e5e7eb;
		transition: all 0.2s;
	}

	.ingredient-row-edit:last-child {
		border-bottom: none;
	}

	.ingredient-row-edit--dragged {
		opacity: 0.5;
	}

	.ingredient-row-edit--drag-over {
		background-color: #f3f4f6;
		border-top: 2px solid #3b82f6;
	}

	.ingredient-cell-edit {
		padding: 0.5rem;
		text-align: left;
	}

	.ingredient-cell-edit--right {
		padding: 0.5rem;
		text-align: right;
		white-space: nowrap;
	}

	.drag-handle {
		cursor: grab;
		color: #9ca3af;
		padding: 0.25rem;
		margin-left: -0.25rem;
		flex-shrink: 0;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.drag-handle-icon {
		width: 1rem;
		height: 1rem;
	}

	.editable-field {
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		margin: -0.25rem -0.5rem;
	}

	.editable-field:hover {
		background-color: #fef3c7;
		box-shadow: 0 0 0 2px #fbbf24;
	}

	.ingredient-name-edit {
		font-size: 0.95rem;
		font-weight: 500;
		color: #111827;
		text-align: left;
		flex: 1;
		min-width: 0;
	}

	.ingredient-name-edit:empty::before {
		content: 'Tap to edit';
		color: #9ca3af;
	}

	.flour-badge-edit {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 0.25rem;
		font-size: 0.65rem;
		font-weight: 600;
		flex-shrink: 0;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.flour-badge-edit--active {
		background-color: #fbbf24;
		color: #ffffff;
	}

	.flour-badge-edit--active:hover {
		background-color: #f59e0b;
	}

	.flour-badge-edit--inactive {
		background-color: #e5e7eb;
		color: #6b7280;
	}

	.flour-badge-edit--inactive:hover {
		background-color: #fbbf24;
		color: #ffffff;
	}

	.flour-badge-edit--disabled {
		background-color: #fbbf24;
		color: #ffffff;
		opacity: 0.5;
		cursor: not-allowed;
	}

	.remove-button-edit {
		background: none;
		border: none;
		cursor: pointer;
		color: #ef4444;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.remove-button-edit:hover {
		background-color: #fee2e2;
	}

	.remove-icon {
		width: 1rem;
		height: 1rem;
	}

	.amount-edit {
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
		display: inline-block;
	}

	.unit-edit {
		font-size: 0.75rem;
		color: #6b7280;
		margin-left: 0.15rem;
	}

	.percentage-edit {
		font-size: 0.95rem;
		font-weight: 500;
		color: #6b7280;
		display: inline-block;
	}

	.percentage-edit-disabled {
		font-size: 0.95rem;
		font-weight: 500;
		color: #6b7280;
	}

	@media (min-width: 640px) {
		.ingredient-cell-edit,
		.ingredient-cell-edit--right {
			padding: 1rem;
		}

		.ingredient-name-edit {
			font-size: 1.125rem;
		}

		.flour-badge-edit {
			width: 1.5rem;
			height: 1.5rem;
			font-size: 0.75rem;
		}

		.drag-handle-icon {
			width: 1.25rem;
			height: 1.25rem;
		}

		.remove-icon {
			width: 1.25rem;
			height: 1.25rem;
		}

		.amount-edit {
			font-size: 1.25rem;
		}

		.unit-edit {
			font-size: 0.875rem;
		}

		.percentage-edit {
			font-size: 1.125rem;
		}

		.percentage-edit-disabled {
			font-size: 1.125rem;
		}
	}
</style>
