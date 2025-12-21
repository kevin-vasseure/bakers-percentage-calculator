<script lang="ts">
	import { totalWeight, currentRecipeStore } from '../stores/currentRecipeStore';
	import EditModal from './EditModal.svelte';

	let showEditModal = false;

	function handleEdit() {
		if ($currentRecipeStore.viewMode) return;
		showEditModal = true;
	}

	function handleSave(value: string | number) {
		const newTotal = Number(value);
		if (!isNaN(newTotal) && newTotal > 0) {
			currentRecipeStore.setTotalWeight(newTotal);
		}
	}
</script>

<button
	type="button"
	class="w-full cursor-pointer border-t-2 border-black bg-black px-8 py-6 text-left text-white transition-colors hover:bg-gray-900"
	onclick={handleEdit}
	disabled={$currentRecipeStore.viewMode}
>
	<div class="flex items-center justify-between">
		<div class="flex items-center">
			<span class="text-lg font-semibold">Total Weight</span>
		</div>
		<div class="text-right">
			<div
				class="inline-block text-3xl font-bold {!$currentRecipeStore.viewMode
					? 'border-b-2 border-dashed border-gray-600'
					: ''}"
			>
				{Math.round($totalWeight)}<span class="ml-1 text-xl text-gray-300">grams</span>
			</div>
			<div class="text-sm text-gray-300">{($totalWeight / 1000).toFixed(2)} kg</div>
		</div>
	</div>
</button>

<EditModal
	isOpen={showEditModal}
	label="Total Weight (g)"
	value={Math.round($totalWeight)}
	type="number"
	unit="g"
	onSave={handleSave}
	onClose={() => (showEditModal = false)}
/>
