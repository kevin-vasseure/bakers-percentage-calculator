<script lang="ts">
	import { currentIngredients, flourCount } from '../stores/currentRecipeStore';
	import IngredientRow from './IngredientRow.svelte';
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
			{#each $currentIngredients as ingredient (ingredient.id)}
				<IngredientRow {ingredient} flourCount={$flourCount} />
			{/each}
		</tbody>
	</table>
</div>
