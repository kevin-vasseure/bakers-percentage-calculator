<script lang="ts">
	import { recipesStore } from '$lib/stores/recipesStore';
	import { currentRecipeStore } from '$lib/stores/currentRecipeStore';

	let {
		onOpenRecipes = undefined as (() => void) | undefined
	} = $props();

	let count = $derived($recipesStore.recipes.length);
	let viewMode = $derived($currentRecipeStore.viewMode);

	function toggleMode() {
		currentRecipeStore.toggleViewMode();
	}
</script>

<!-- Floating bottom dock: view/edit toggle + recipes -->
<div class="dock-wrap">
	<div class="dock">
		<button
			type="button"
			class="dock-btn dock-btn--toggle"
			onclick={toggleMode}
			aria-label={viewMode ? 'Switch to edit mode' : 'Switch to view mode'}
		>
			<span class="dock-icon" aria-hidden="true">
				{#if viewMode}
					<!-- Pen / Edit -->
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				{:else}
					<!-- Eye / View -->
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						/>
					</svg>
				{/if}
			</span>
			<span class="dock-label">{viewMode ? 'Edit' : 'View'}</span>
		</button>

		<button
			type="button"
			class="dock-btn dock-btn--recipes"
			onclick={() => onOpenRecipes?.()}
		>
			<span class="dock-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			</span>
			<span class="dock-label">Recipes</span>
			<span class="dock-count" class:dock-count--empty={count === 0}>{count}</span>
		</button>
	</div>
</div>

<style>
	/* Mobile-first: full-width control bar anchored to the bottom */
	.dock-wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 1rem;
		z-index: 40;
		display: flex;
		justify-content: center;
		padding: 0 1rem;
		padding-bottom: env(safe-area-inset-bottom, 0);
		pointer-events: none;
	}

	.dock {
		pointer-events: auto;
		display: flex;
		width: 100%;
		background: #fff;
		border: 2px solid #000;
		box-shadow: var(--shadow-hard);
	}

	.dock-btn {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
		padding: 0.875rem 1rem;
		background: transparent;
		border: none;
		font-family: var(--font-display);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-size: 0.8125rem;
		color: #000;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.dock-btn:hover {
		background: var(--hover-light);
	}

	.dock-btn:active {
		background: #ddddd5;
	}

	.dock-btn:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: -3px;
	}

	/* Divider between the two segments */
	.dock-btn--toggle {
		border-right: 2px solid #000;
	}

	.dock-icon {
		display: inline-flex;
	}

	.dock-icon svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.dock-label {
		line-height: 1;
	}

	.dock-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.625rem;
		height: 1.625rem;
		padding: 0 0.4rem;
		background: var(--accent);
		color: var(--accent-ink);
		border: 2px solid #000;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0;
	}

	.dock-count--empty {
		background: #e5e5e0;
		color: #6b6b66;
	}

	/* Larger screens: collapse into a compact centered control cluster */
	@media (min-width: 481px) {
		.dock-wrap {
			bottom: 1.5rem;
		}
		.dock {
			width: auto;
		}
		.dock-btn {
			flex: 0 0 auto;
			padding: 0.75rem 1.25rem;
		}
	}
</style>
