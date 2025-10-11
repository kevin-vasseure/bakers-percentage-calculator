<script lang="ts">
	import type { Ingredient } from '../stores/ingredientsStore';

	export let ingredient: Ingredient;
</script>

<tr class="ingredient-row-view">
	<td class="ingredient-cell-view">
		<div class="flex items-center gap-2">
			<span class="ingredient-name-view">{ingredient.name}</span>
			{#if ingredient.isFlour}
				<span class="flour-badge-view">F</span>
			{/if}
		</div>
	</td>
	<td class="ingredient-cell-view--right">
		<span class="amount-view">{ingredient.amount}<span class="unit-view">g</span></span>
	</td>
	<td class="ingredient-cell-view--right">
		<span class="percentage-view">{ingredient.percentage.toFixed(1)}%</span>
	</td>
</tr>

<style>
	.ingredient-row-view {
		border-bottom: 1px solid #e5e7eb;
	}

	.ingredient-row-view:last-child {
		border-bottom: none;
	}

	.ingredient-cell-view {
		padding: 0.5rem;
		text-align: left;
	}

	.ingredient-cell-view--right {
		padding: 0.5rem;
		text-align: right;
		white-space: nowrap;
	}

	.ingredient-name-view {
		font-size: 0.95rem;
		font-weight: 500;
		color: #111827;
	}

	.flour-badge-view {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		background-color: #fbbf24;
		color: #ffffff;
		border-radius: 0.25rem;
		font-size: 0.65rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.amount-view {
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
	}

	.unit-view {
		font-size: 0.75rem;
		color: #6b7280;
		margin-left: 0.15rem;
	}

	.percentage-view {
		font-size: 0.95rem;
		font-weight: 500;
		color: #6b7280;
	}

	@media (min-width: 640px) {
		.ingredient-cell-view,
		.ingredient-cell-view--right {
			padding: 1rem;
		}

		.ingredient-name-view {
			font-size: 1.125rem;
		}

		.flour-badge-view {
			width: 1.5rem;
			height: 1.5rem;
			font-size: 0.75rem;
		}

		.amount-view {
			font-size: 1.25rem;
		}

		.unit-view {
			font-size: 0.875rem;
		}

		.percentage-view {
			font-size: 1.125rem;
		}
	}
</style>
