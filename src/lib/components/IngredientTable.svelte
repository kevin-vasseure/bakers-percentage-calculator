<script lang="ts">
	import { currentIngredients, flourCount, currentRecipeStore } from '../stores/currentRecipeStore';
	import IngredientRow from './IngredientRow.svelte';
	import IngredientRowView from './IngredientRowView.svelte';

	$: viewMode = $currentRecipeStore.viewMode;
</script>

<div class="ingredient-table-container overflow-x-auto">
	<table class="ingredient-table">
		{#if !viewMode}
			<thead class="table-header">
				<tr>
					<th class="table-header-cell table-header-cell--ingredient">Ingredient</th>
					<th class="table-header-cell table-header-cell--weight">Weight (g)</th>
					<th class="table-header-cell table-header-cell--percentage">Percentage</th>
					<th class="table-header-cell table-header-cell--actions"></th>
				</tr>
			</thead>
		{/if}
		<tbody class="table-body">
			{#each $currentIngredients as ingredient (ingredient.id)}
				{#if viewMode}
					<IngredientRowView {ingredient} />
				{:else}
					<IngredientRow {ingredient} flourCount={$flourCount} />
				{/if}
			{/each}
		</tbody>
	</table>
</div>
