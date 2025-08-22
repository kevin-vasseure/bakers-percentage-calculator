<script lang="ts">
	import type { Ingredient } from '../stores/ingredientsStore';
	import { ingredientsStore } from '../stores/ingredientsStore';
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

		ingredientsStore.reorder(draggedId, ingredient.id);
		dragDropStore.endDrag();
	}

	function handleDragEnd(): void {
		dragDropStore.endDrag();
	}
</script>

<tr
	draggable="true"
	class="hover:bg-amber-25 group transition-colors duration-200 {isDragged
		? 'scale-95 opacity-50'
		: ''} {isDragOver ? 'border-l-4 border-amber-500 bg-amber-100' : ''}"
	on:dragstart={handleDragStart}
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:dragend={handleDragEnd}
>
	<!-- Drag Handle & Ingredient Name (Editable) -->
	<td class="px-6 py-4">
		<div class="flex items-center">
			<div
				class="mr-3 cursor-grab text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
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
			<div class="flex-1">
				{#if ingredient.isEditing}
					<input
						type="text"
						class="w-full rounded-lg border-2 border-amber-300 px-3 py-2 font-medium transition-all duration-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
						value={ingredient.name}
						on:blur={() => ingredientsStore.toggleEdit(ingredient.id)}
						on:keydown={(e) => e.key === 'Enter' && ingredientsStore.toggleEdit(ingredient.id)}
						on:input={(e) => ingredientsStore.updateName(ingredient.id, (e.target as HTMLInputElement).value)}
						on:click|stopPropagation
						aria-label="Edit ingredient name"
					/>
				{:else}
					<button
						type="button"
						class="w-full rounded-lg px-3 py-2 text-left font-medium text-gray-800 transition-colors duration-200 hover:bg-amber-100 focus:ring-2 focus:ring-amber-300 focus:outline-none"
						on:click|stopPropagation={() => ingredientsStore.toggleEdit(ingredient.id)}
						on:keydown={(e) => e.key === 'Enter' && ingredientsStore.toggleEdit(ingredient.id)}
						aria-label={`Edit ${ingredient.name || 'ingredient'}`}
					>
						{ingredient.name || 'Click to edit'}
						<span
							class="ml-2 text-amber-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
						>✏️</span>
					</button>
				{/if}
			</div>
		</div>
	</td>

	<!-- Flour Checkbox -->
	<td class="px-4 py-4 text-center">
		<div
			role="checkbox"
			tabindex="0"
			class="inline-flex items-center justify-center {ingredient.isFlour && flourCount === 1
				? 'cursor-not-allowed opacity-50'
				: 'cursor-pointer'}"
			on:click={() => !(ingredient.isFlour && flourCount === 1) && ingredientsStore.toggleFlour(ingredient.id)}
			on:keydown={(e) =>
				e.key === ' ' && !(ingredient.isFlour && flourCount === 1) && ingredientsStore.toggleFlour(ingredient.id)}
			aria-checked={ingredient.isFlour}
			aria-label={ingredient.isFlour && flourCount === 1
				? 'Cannot uncheck - at least one flour base is required'
				: ingredient.isFlour
				? `${ingredient.name} is a flour base`
				: `Set ${ingredient.name || 'ingredient'} as flour base`}
		>
			<input
				type="checkbox"
				bind:checked={ingredient.isFlour}
				disabled={ingredient.isFlour && flourCount === 1}
				class="pointer-events-none h-5 w-5 rounded border-2 border-amber-300 text-amber-600 focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
			/>
			{#if ingredient.isFlour}
				<span class="ml-2 text-sm font-semibold text-amber-600">BASE</span>
			{/if}
		</div>
	</td>

	<!-- Percentage Input -->
	<td class="px-4 py-4 text-right">
		{#if !ingredient.isFlour}
			<div class="relative">
				<input
					type="number"
					class="w-20 rounded-lg border-2 border-gray-200 px-3 py-2 text-right font-mono transition-all duration-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
					value={ingredient.percentage}
					on:input={(e) => ingredientsStore.updatePercentage(ingredient.id, parseFloat((e.target as HTMLInputElement).value) || 0)}
					min="0"
					step="0.1"
					aria-label={`${ingredient.name || 'Ingredient'} percentage`}
				/>
				<span
					class="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 transform text-sm text-gray-400"
				>%</span>
			</div>
		{:else}
			<div class="inline-flex items-center rounded-lg bg-amber-100 px-3 py-2 font-semibold text-amber-800">
				100%
			</div>
		{/if}
	</td>

	<!-- Amount Input/Display -->
	<td class="px-4 py-4 text-right">
		<div class="relative">
			<input
				type="number"
				class="w-24 rounded-lg border-2 border-gray-200 px-3 py-2 text-right font-mono transition-all duration-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 {ingredient.isFlour
					? 'border-amber-300 bg-amber-50'
					: ''}"
				value={ingredient.amount}
				on:input={(e) => ingredientsStore.updateAmount(ingredient.id, parseFloat((e.target as HTMLInputElement).value) || 0)}
				min="0"
				step="0.1"
				aria-label={`${ingredient.name || 'Ingredient'} amount in grams`}
			/>
			<span
				class="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 transform text-xs text-gray-400"
			>g</span>
		</div>
	</td>

	<!-- Remove Button -->
	<td class="px-4 py-4 text-right">
		<button
			type="button"
			on:click|stopPropagation={() => ingredientsStore.remove(ingredient.id)}
			class="rounded-lg p-2 text-red-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus:opacity-100 focus:ring-2 focus:ring-red-300 focus:outline-none"
			aria-label={`Remove ${ingredient.name || 'ingredient'}`}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
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