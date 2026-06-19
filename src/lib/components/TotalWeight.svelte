<script lang="ts">
	import {
		totalWeight,
		portions,
		weightPerPortion,
		currentRecipeStore
	} from '../stores/currentRecipeStore';
	import EditModal from './EditModal.svelte';

	let showWeightModal = $state(false);
	let showPerPortionModal = $state(false);
	let showPortionsModal = $state(false);

	let viewMode = $derived($currentRecipeStore.viewMode);

	function editTotal() {
		if (!viewMode) showWeightModal = true;
	}

	function editPerPortion() {
		if (!viewMode) showPerPortionModal = true;
	}

	function editPortions() {
		if (!viewMode) showPortionsModal = true;
	}

	function saveTotal(value: string | number) {
		const n = Number(value);
		if (!isNaN(n) && n > 0) currentRecipeStore.setTotalWeight(n);
	}

	function savePerPortion(value: string | number) {
		const n = Number(value);
		if (!isNaN(n) && n > 0) currentRecipeStore.setWeightPerPortion(n);
	}

	function savePortions(value: string | number) {
		const n = Math.floor(Number(value));
		if (!isNaN(n) && n >= 1) currentRecipeStore.setPortions(n);
	}

	function decPortions() {
		currentRecipeStore.setPortions($portions - 1);
	}

	function incPortions() {
		currentRecipeStore.setPortions($portions + 1);
	}
</script>

<div class="weight-bar">
	<!-- Total weight -->
	<div class="weight-row">
		<span class="weight-label">Total Weight</span>
		<button type="button" class="value-button" onclick={editTotal} disabled={viewMode}>
			<span class="value-amount" class:editable={!viewMode}>
				{Math.round($totalWeight)}<span class="value-unit">grams</span>
			</span>
			<span class="value-sub">{($totalWeight / 1000).toFixed(2)} kg</span>
		</button>
	</div>

	<!-- Portions + per-portion -->
	<div class="portion-row">
		<div class="portion-control">
			<span class="weight-label">Portions</span>
			{#if !viewMode}
				<div class="stepper">
					<button
						type="button"
						class="stepper-btn"
						onclick={decPortions}
						disabled={$portions <= 1}
						aria-label="Decrease portions">−</button
					>
					<button
						type="button"
						class="stepper-value editable"
						onclick={editPortions}
						aria-label="Edit portions">{$portions}</button
					>
					<button
						type="button"
						class="stepper-btn"
						onclick={incPortions}
						aria-label="Increase portions">+</button
					>
				</div>
			{:else}
				<span class="stepper-value-static">{$portions}</span>
			{/if}
		</div>

		{#if $portions > 1}
			<button type="button" class="value-button" onclick={editPerPortion} disabled={viewMode}>
				<span class="per-portion-label">Per portion</span>
				<span class="value-amount value-amount--sm" class:editable={!viewMode}>
					{Math.round($weightPerPortion)}<span class="value-unit">g</span>
				</span>
			</button>
		{/if}
	</div>
</div>

<EditModal
	isOpen={showWeightModal}
	label="Total Weight (g)"
	value={Math.round($totalWeight)}
	type="number"
	unit="g"
	onSave={saveTotal}
	onClose={() => (showWeightModal = false)}
/>

<EditModal
	isOpen={showPerPortionModal}
	label="Weight per portion (g)"
	value={Math.round($weightPerPortion)}
	type="number"
	unit="g"
	onSave={savePerPortion}
	onClose={() => (showPerPortionModal = false)}
/>

<EditModal
	isOpen={showPortionsModal}
	label="Number of portions"
	value={$portions}
	type="number"
	unit="×"
	onSave={savePortions}
	onClose={() => (showPortionsModal = false)}
/>

<style>
	.weight-bar {
		border-top: 2px solid #000;
		background: #000;
		color: #fff;
		padding: 1.25rem 2rem;
	}

	.weight-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.weight-label {
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.value-button {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.125rem;
		background: transparent;
		border: none;
		color: inherit;
		text-align: right;
		padding: 0;
	}

	.value-button:not(:disabled) {
		cursor: pointer;
	}

	.value-amount {
		font-family: var(--font-mono);
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1.1;
	}

	.value-amount--sm {
		font-size: 1.25rem;
	}

	.value-amount.editable {
		border-bottom: 2px dashed #6b6b66;
	}

	.value-unit {
		margin-left: 0.35rem;
		font-family: var(--font-display);
		font-size: 0.7em;
		font-weight: 600;
		color: #b5b5b0;
	}

	.value-sub {
		font-size: 0.8125rem;
		color: #b5b5b0;
	}

	/* Portions row */
	.portion-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #333;
	}

	.portion-control {
		display: flex;
		align-items: center;
		gap: 0.875rem;
	}

	.stepper {
		display: inline-flex;
		align-items: stretch;
		border: 2px solid #fff;
	}

	.stepper-btn {
		width: 2rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: #fff;
		border: none;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.stepper-btn:hover:not(:disabled) {
		background: #fff;
		color: #000;
	}

	.stepper-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.stepper-value {
		min-width: 2.5rem;
		padding: 0.375rem 0.5rem;
		background: transparent;
		color: #fff;
		border: none;
		border-left: 2px solid #fff;
		border-right: 2px solid #fff;
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.stepper-value:hover {
		background: #fff;
		color: #000;
	}

	.stepper-value-static {
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 700;
	}

	.per-portion-label {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #b5b5b0;
	}

	@media (max-width: 480px) {
		.weight-bar {
			padding: 1.25rem 1.25rem;
		}
		.value-amount {
			font-size: 1.5rem;
		}
	}
</style>
