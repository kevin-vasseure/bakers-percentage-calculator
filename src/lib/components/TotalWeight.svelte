<script lang="ts">
	import { totalWeight } from '../stores/currentRecipeStore';
</script>

<div class="border-t-2 border-black bg-black px-8 py-6 text-white">
	<div class="flex items-center justify-between">
		<div class="flex items-center">
			<span class="text-lg font-semibold">Total Weight</span>
		</div>
		<div class="text-right">
			<div class="text-3xl font-bold">
				{$totalWeight}<span class="ml-1 text-xl text-gray-300">grams</span>
			</div>
			<div class="text-sm text-gray-300">{($totalWeight / 1000).toFixed(2)} kg</div>
		</div>
	</div>
</div>
