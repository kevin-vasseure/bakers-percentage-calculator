<script lang="ts">
	import { currentIngredients, flourCount, currentRecipeStore } from '../stores/currentRecipeStore';
	import IngredientRowView from './IngredientRowView.svelte';
	import IngredientRowEdit from './IngredientRowEdit.svelte';

	let viewMode = $derived($currentRecipeStore.viewMode);
	let totalFlourWeight = $derived($currentIngredients
		.filter((i) => i.isFlour)
		.reduce((sum, i) => sum + i.amount, 0));
</script>

<div class="ingredient-table-container overflow-x-auto">
	<table class="ingredient-table">
		<tbody class="table-body">
			{#each $currentIngredients as ingredient, i (ingredient.id)}
				{#if viewMode}
					<IngredientRowView {ingredient} {totalFlourWeight} />
				{:else}
					<IngredientRowEdit
						{ingredient}
						flourCount={$flourCount}
						{totalFlourWeight}
						isFirst={i === 0}
						isLast={i === $currentIngredients.length - 1}
					/>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
