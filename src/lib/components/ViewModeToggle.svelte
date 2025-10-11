<script lang="ts">
	import { currentRecipeStore } from '../stores/currentRecipeStore';

	$: viewMode = $currentRecipeStore.viewMode;

	function toggleMode() {
		currentRecipeStore.toggleViewMode();
	}
</script>

<button
	type="button"
	class="floating-toggle-button"
	onclick={toggleMode}
	aria-label={viewMode ? 'Switch to edit mode' : 'Switch to view mode'}
	title={viewMode ? 'Edit Recipe' : 'View Recipe'}
>
	{#if viewMode}
		<!-- Pen/Edit Icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="icon"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
			/>
		</svg>
	{:else}
		<!-- Eye/View Icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="icon"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
			/>
		</svg>
	{/if}
</button>

<style>
	.floating-toggle-button {
		position: fixed;
		bottom: 6rem;
		right: 2rem;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: white;
		color: black;
		border: 2px solid black;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		z-index: 1000;
	}

	.floating-toggle-button:hover {
		background: black;
		color: white;
		transform: scale(1.1);
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.2),
			0 4px 6px -2px rgba(0, 0, 0, 0.1);
	}

	.floating-toggle-button:active {
		transform: scale(1.05);
	}

	.icon {
		width: 1.75rem;
		height: 1.75rem;
		stroke-width: 2.5;
	}

	/* Desktop - position above the bottom bar */
	@media (min-width: 641px) {
		.floating-toggle-button {
			bottom: 6rem; /* Above the bottom bar */
		}
	}

	/* Mobile - position higher to avoid bottom bar */
	@media (max-width: 640px) {
		.floating-toggle-button {
			bottom: 5.5rem; /* Above the mobile bottom bar */
			right: 1rem;
			width: 3rem;
			height: 3rem;
		}

		.icon {
			width: 1.5rem;
			height: 1.5rem;
		}
	}
</style>
