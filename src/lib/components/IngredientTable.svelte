<script lang="ts">
	import { ingredientsStore } from '../stores/ingredientsStore';
	import { getFlourCount } from '../utils/calculations';
	import IngredientRow from './IngredientRow.svelte';

	$: flourCount = getFlourCount($ingredientsStore);
</script>

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
			{#each $ingredientsStore as ingredient (ingredient.id)}
				<IngredientRow {ingredient} {flourCount} />
			{/each}
		</tbody>
	</table>
</div>