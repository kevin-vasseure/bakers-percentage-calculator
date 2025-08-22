<script lang="ts">
	import { ingredientsStore } from '../stores/ingredientsStore';
	import { calculateTotalWeight } from '../utils/calculations';

	$: totalWeight = calculateTotalWeight($ingredientsStore);
</script>

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