<script lang="ts">
	interface Ingredient {
		id: number;
		name: string;
		isFlour: boolean;
		amount: number;
		percentage: number;
		isEditing: boolean;
	}

	// Initialize with some default ingredients
	let ingredients: Ingredient[] = [
		{ id: 1, name: 'Bread Flour', isFlour: true, amount: 1000, percentage: 100, isEditing: false },
		{ id: 2, name: 'Water', isFlour: false, amount: 700, percentage: 70, isEditing: false },
		{ id: 3, name: 'Salt', isFlour: false, amount: 20, percentage: 2, isEditing: false },
		{ id: 4, name: 'Yeast', isFlour: false, amount: 1, percentage: 0.1, isEditing: false }
	];

	let nextId: number = 5;

	// Add a new ingredient row
	function addIngredient() {
		ingredients = [
			...ingredients,
			{
				id: nextId++,
				name: 'New Ingredient',
				isFlour: false,
				amount: 0,
				percentage: 0,
				isEditing: true
			}
		];
	}

	// Remove an ingredient by id
	function removeIngredient(id: number): void {
		ingredients = ingredients.filter((ing) => ing.id !== id);
		// If we removed the last flour, make sure we have at least one flour
		if (!ingredients.some((ing) => ing.isFlour) && ingredients.length > 0) {
			ingredients = ingredients.map((ing, index) =>
				index === 0 ? { ...ing, isFlour: true } : ing
			);
			updateAmounts();
		}
	}

	// Toggle flour status for an ingredient
	function toggleFlour(id: number): void {
		ingredients = ingredients.map((ing) =>
			ing.id === id ? { ...ing, isFlour: !ing.isFlour } : ing
		);
		updateAmounts();
	}

	// Update amounts when flour quantity or percentages change
	function updateAmounts(): void {
		const flours = ingredients
			.filter((ing) => ing.isFlour)
			.reduce((acc, ing) => acc + ing.amount, 0);
		if (!flours) return;

		ingredients = ingredients.map((ing) => {
			if (ing.isFlour) return ing;
			return {
				...ing,
				amount: Math.round((ing.percentage / 100) * flours * 100) / 100
			};
		});
	}

	// Update percentages when flour quantity changes
	function updatePercentages(): void {
		const totalFlourWeight = ingredients
			.filter((ing) => ing.isFlour)
			.reduce((sum, ing) => sum + ing.amount, 0);

		if (totalFlourWeight === 0) return;

		ingredients = ingredients.map((ing) => {
			if (ing.isFlour) return ing;
			return {
				...ing,
				percentage: Math.round((ing.amount / totalFlourWeight) * 100 * 100) / 100
			};
		});
	}

	// Handle changes to ingredient amount
	function handleAmountChange(id: number, value: string): void {
		const numValue = parseFloat(value) || 0;
		ingredients = ingredients.map((ing) => (ing.id === id ? { ...ing, amount: numValue } : ing));
		const updatedIngredient = ingredients.find((ing) => ing.id === id);
		if (updatedIngredient && !updatedIngredient.isFlour) {
			updatePercentages();
		} else if (updatedIngredient && updatedIngredient.isFlour) {
			updateAmounts();
		}
	}

	// Handle changes to ingredient percentage
	function handlePercentageChange(id: number, value: string): void {
		const numValue = parseFloat(value) || 0;
		ingredients = ingredients.map((ing) =>
			ing.id === id ? { ...ing, percentage: numValue } : ing
		);
		updateAmounts();
	}

	// Toggle edit mode for ingredient name
	function toggleEdit(id: number): void {
		ingredients = ingredients.map((ing) =>
			ing.id === id ? { ...ing, isEditing: !ing.isEditing } : ing
		);
	}

	// Handle name change
	function handleNameChange(id: number, newName: string): void {
		ingredients = ingredients.map((ing) => (ing.id === id ? { ...ing, name: newName } : ing));
	}

	// Calculate total weight
	$: totalWeight = ingredients.reduce((sum, ing) => sum + (ing.amount || 0), 0);

	// Calculate number of flour ingredients
	$: flourCount = ingredients.filter((ing) => ing.isFlour).length;

	// Drag and drop state
	let draggedId: number | null = null;
	let dragOverId: number | null = null;

	// Drag and drop handlers
	function handleDragStart(e: DragEvent, id: number): void {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/html', id.toString());
		}
		draggedId = id;
	}

	function handleDragOver(e: DragEvent, id: number): void {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		dragOverId = id;
	}

	function handleDragLeave(): void {
		dragOverId = null;
	}

	function handleDrop(e: DragEvent, targetId: number): void {
		e.preventDefault();

		if (draggedId === null || draggedId === targetId) {
			draggedId = null;
			dragOverId = null;
			return;
		}

		const draggedIndex = ingredients.findIndex((ing) => ing.id === draggedId);
		const targetIndex = ingredients.findIndex((ing) => ing.id === targetId);

		if (draggedIndex === -1 || targetIndex === -1) {
			draggedId = null;
			dragOverId = null;
			return;
		}

		// Reorder the ingredients array
		const newIngredients = [...ingredients];
		const [draggedItem] = newIngredients.splice(draggedIndex, 1);
		newIngredients.splice(targetIndex, 0, draggedItem);

		ingredients = newIngredients;
		draggedId = null;
		dragOverId = null;
	}

	function handleDragEnd(): void {
		draggedId = null;
		dragOverId = null;
	}
</script>

<div class="min-h-screen px-4 py-8">
	<div class="mx-auto max-w-4xl">
		<div class="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-xl">
			<header class="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 text-white">
				<h1 class="text-center text-3xl font-bold">Baker's Percentage Calculator</h1>
				<p class="mt-2 text-center text-amber-100">Calculate perfect bread ratios with ease</p>
			</header>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b-2 border-amber-200 bg-amber-50">
						<tr>
							<th class="w-1/3 px-6 py-4 text-left font-semibold text-amber-900">Ingredient</th>
							<th class="w-24 px-4 py-4 text-center font-semibold text-amber-900">Flour</th>
							<th class="w-24 px-4 py-4 text-right font-semibold text-amber-900">Percentage</th>
							<th class="w-24 px-4 py-4 text-right font-semibold text-amber-900">Weight (g)</th>
							<th class="w-12 px-4 py-4"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-amber-100">
						{#each ingredients as ing (ing.id)}
							<tr
								draggable="true"
								class="hover:bg-amber-25 group transition-colors duration-200 {draggedId === ing.id
									? 'scale-95 opacity-50'
									: ''} {dragOverId === ing.id ? 'border-l-4 border-amber-500 bg-amber-100' : ''}"
								on:dragstart={(e) => handleDragStart(e, ing.id)}
								on:dragover={(e) => handleDragOver(e, ing.id)}
								on:dragleave={handleDragLeave}
								on:drop={(e) => handleDrop(e, ing.id)}
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
											{#if ing.isEditing}
												<input
													type="text"
													class="w-full rounded-lg border-2 border-amber-300 px-3 py-2 font-medium transition-all duration-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
													value={ing.name}
													on:blur={() => toggleEdit(ing.id)}
													on:keydown={(e: KeyboardEvent) => e.key === 'Enter' && toggleEdit(ing.id)}
													on:input={(e: Event) =>
														handleNameChange(ing.id, (e.target as HTMLInputElement).value)}
													on:click|stopPropagation
													aria-label="Edit ingredient name"
												/>
											{:else}
												<button
													type="button"
													class="w-full rounded-lg px-3 py-2 text-left font-medium text-gray-800 transition-colors duration-200 hover:bg-amber-100 focus:ring-2 focus:ring-amber-300 focus:outline-none"
													on:click|stopPropagation={() => toggleEdit(ing.id)}
													on:keydown={(e: KeyboardEvent) => e.key === 'Enter' && toggleEdit(ing.id)}
													aria-label={`Edit ${ing.name || 'ingredient'}`}
												>
													{ing.name || 'Click to edit'}
													<span
														class="ml-2 text-amber-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
														>✏️</span
													>
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
										class="inline-flex items-center justify-center {ing.isFlour && flourCount === 1
											? 'cursor-not-allowed opacity-50'
											: 'cursor-pointer'}"
										on:click={() => !(ing.isFlour && flourCount === 1) && toggleFlour(ing.id)}
										on:keydown={(e: KeyboardEvent) =>
											e.key === ' ' && !(ing.isFlour && flourCount === 1) && toggleFlour(ing.id)}
										aria-checked={ing.isFlour}
										aria-label={ing.isFlour && flourCount === 1
											? 'Cannot uncheck - at least one flour base is required'
											: ing.isFlour
												? `${ing.name} is a flour base`
												: `Set ${ing.name || 'ingredient'} as flour base`}
									>
										<input
											type="checkbox"
											bind:checked={ing.isFlour}
											disabled={ing.isFlour && flourCount === 1}
											class="pointer-events-none h-5 w-5 rounded border-2 border-amber-300 text-amber-600 focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
										/>
										{#if ing.isFlour}
											<span class="ml-2 text-sm font-semibold text-amber-600">BASE</span>
										{/if}
									</div>
								</td>

								<!-- Percentage Input -->
								<td class="px-4 py-4 text-right">
									{#if !ing.isFlour}
										<div class="relative">
											<input
												type="number"
												class="w-20 rounded-lg border-2 border-gray-200 px-3 py-2 text-right font-mono transition-all duration-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
												value={ing.percentage}
												on:input={(e: Event) =>
													handlePercentageChange(ing.id, (e.target as HTMLInputElement).value)}
												min="0"
												step="0.1"
												aria-label={`${ing.name || 'Ingredient'} percentage`}
											/>
											<span
												class="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 transform text-sm text-gray-400"
												>%</span
											>
										</div>
									{:else}
										<div
											class="inline-flex items-center rounded-lg bg-amber-100 px-3 py-2 font-semibold text-amber-800"
										>
											100%
										</div>
									{/if}
								</td>

								<!-- Amount Input/Display -->
								<td class="px-4 py-4 text-right">
									<div class="relative">
										<input
											type="number"
											class="w-24 rounded-lg border-2 border-gray-200 px-3 py-2 text-right font-mono transition-all duration-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 {ing.isFlour
												? 'border-amber-300 bg-amber-50'
												: ''}"
											value={ing.amount}
											on:input={(e: Event) =>
												handleAmountChange(ing.id, (e.target as HTMLInputElement).value)}
											min="0"
											step="0.1"
											aria-label={`${ing.name || 'Ingredient'} amount in grams`}
										/>
										<span
											class="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 transform text-xs text-gray-400"
											>g</span
										>
									</div>
								</td>

								<!-- Remove Button -->
								<td class="px-4 py-4 text-right">
									<button
										type="button"
										on:click|stopPropagation={() => removeIngredient(ing.id)}
										class="rounded-lg p-2 text-red-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus:opacity-100 focus:ring-2 focus:ring-red-300 focus:outline-none"
										aria-label={`Remove ${ing.name || 'ingredient'}`}
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
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Add Ingredient Button -->
			<div class="bg-amber-25 border-t border-amber-100 px-8 py-6">
				<button
					type="button"
					on:click={addIngredient}
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
			</div>

			<!-- Total Weight -->
			<div class="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6 text-white">
				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<span class="mr-3 text-2xl">⚖️</span>
						<span class="text-lg font-semibold">Total Recipe Weight</span>
					</div>
					<div class="text-right">
						<div class="text-3xl font-bold">
							{totalWeight.toFixed(1)}<span class="ml-1 text-xl opacity-90">grams</span>
						</div>
						<div class="text-sm text-emerald-100">{(totalWeight / 1000).toFixed(2)} kg</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Help Section -->
		<div class="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
			<div class="bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-4 text-white">
				<h2 class="flex items-center text-xl font-bold">
					<span class="mr-2">💡</span>
					How to Use This Calculator
				</h2>
			</div>
			<div class="p-8">
				<div class="grid gap-6 md:grid-cols-2">
					<div class="space-y-4">
						<div class="flex items-start">
							<div
								class="mt-0.5 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600"
							>
								1
							</div>
							<div>
								<h3 class="mb-1 font-semibold text-gray-800">Edit Ingredient Names</h3>
								<p class="text-sm text-gray-600">
									Click on any ingredient name to edit it. Press Enter or click outside to save.
								</p>
							</div>
						</div>
						<div class="flex items-start">
							<div
								class="mt-0.5 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600"
							>
								2
							</div>
							<div>
								<h3 class="mb-1 font-semibold text-gray-800">Set Your Flour Base</h3>
								<p class="text-sm text-gray-600">
									Check the "Flour" box to designate your reference flour (typically 100%).
								</p>
							</div>
						</div>
					</div>
					<div class="space-y-4">
						<div class="flex items-start">
							<div
								class="mt-0.5 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600"
							>
								3
							</div>
							<div>
								<h3 class="mb-1 font-semibold text-gray-800">Auto-Calculate</h3>
								<p class="text-sm text-gray-600">
									Enter either percentage or weight - the other value updates automatically!
								</p>
							</div>
						</div>
						<div class="space-y-4">
							<div class="flex items-start">
								<div
									class="mt-0.5 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600"
								>
									4
								</div>
								<div>
									<h3 class="mb-1 font-semibold text-gray-800">Drag & Drop Reordering</h3>
									<p class="text-sm text-gray-600">
										Drag ingredients by the handle (≡) to reorder them in your recipe.
									</p>
								</div>
							</div>
							<div class="flex items-start">
								<div
									class="mt-0.5 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600"
								>
									5
								</div>
								<div>
									<h3 class="mb-1 font-semibold text-gray-800">Manage Ingredients</h3>
									<p class="text-sm text-gray-600">
										Add new ingredients or remove existing ones by hovering over rows.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
