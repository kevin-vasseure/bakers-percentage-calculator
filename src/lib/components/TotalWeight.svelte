<script lang="ts">
	import { ingredientsStore } from '../stores/ingredientsStore';
	import { calculateTotalWeight } from '../utils/calculations';

	$: totalWeight = calculateTotalWeight($ingredientsStore);
</script>

<div class="bg-black px-8 py-6 text-white border-t-2 border-black">
	<div class="flex items-center justify-between">
		<div class="flex items-center">
			<span class="mr-3 text-2xl">⚖️</span>
			<span class="text-lg font-semibold">Total Recipe Weight</span>
		</div>
		<div class="text-right">
			<div class="text-3xl font-bold">
				{totalWeight.toFixed(1)}<span class="ml-1 text-xl text-gray-300">grams</span>
			</div>
			<div class="text-sm text-gray-300">{(totalWeight / 1000).toFixed(2)} kg</div>
		</div>
	</div>
</div>