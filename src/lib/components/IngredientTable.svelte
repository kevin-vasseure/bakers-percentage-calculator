<script lang="ts">
	import { ingredientsStore } from '../stores/ingredientsStore';
	import { getFlourCount } from '../utils/calculations';
	import IngredientRow from './IngredientRow.svelte';

	$: flourCount = getFlourCount($ingredientsStore);
</script>

<div class="ingredient-table-container overflow-x-auto">
	<table class="ingredient-table">
		<thead class="table-header">
			<tr>
				<th class="table-header-cell table-header-cell--ingredient">Ingredient</th>
				<th class="table-header-cell table-header-cell--weight">Weight (g)</th>
				<th class="table-header-cell table-header-cell--percentage">Percentage</th>
				<th class="table-header-cell table-header-cell--actions"></th>
			</tr>
		</thead>
		<tbody class="table-body">
			{#each $ingredientsStore as ingredient (ingredient.id)}
				<IngredientRow {ingredient} {flourCount} />
			{/each}
		</tbody>
	</table>
</div>
