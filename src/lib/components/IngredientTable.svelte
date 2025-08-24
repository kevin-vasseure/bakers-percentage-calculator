<script lang="ts">
	import { ingredientsStore } from '../stores/ingredientsStore';
	import { getFlourCount } from '../utils/calculations';
	import IngredientRow from './IngredientRow.svelte';

	$: flourCount = getFlourCount($ingredientsStore);
</script>

<div class="overflow-x-auto">
	<table class="w-full">
		<thead class="border-b-2 border-black bg-gray-100">
			<tr>
				<th class="w-1/3 px-6 py-4 text-left font-semibold text-black">Ingredient</th>
				<th class="w-24 px-4 py-4 text-center font-semibold text-black">Flour</th>
				<th class="w-24 px-4 py-4 text-right font-semibold text-black">Percentage</th>
				<th class="w-24 px-4 py-4 text-right font-semibold text-black">Weight (g)</th>
				<th class="w-12 px-4 py-4"></th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-300">
			{#each $ingredientsStore as ingredient (ingredient.id)}
				<IngredientRow {ingredient} {flourCount} />
			{/each}
		</tbody>
	</table>
</div>