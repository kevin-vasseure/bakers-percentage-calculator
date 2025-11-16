<script lang="ts">
	import { currentIngredients, flourCount, currentRecipeStore } from '../stores/currentRecipeStore';
	import IngredientRowView from './IngredientRowView.svelte';
	import IngredientRowEdit from './IngredientRowEdit.svelte';

	$: viewMode = $currentRecipeStore.viewMode;
</script>

<div class="ingredient-table-container overflow-x-auto">
	<table class="ingredient-table">
		<tbody class="table-body">
			{#each $currentIngredients as ingredient (ingredient.id)}
				{#if viewMode}
					<IngredientRowView {ingredient} />
				{:else}
					<IngredientRowEdit {ingredient} flourCount={$flourCount} />
				{/if}
			{/each}
		</tbody>
	</table>
</div>
