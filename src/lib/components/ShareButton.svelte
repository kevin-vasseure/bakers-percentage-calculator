<script lang="ts">
	import { browser } from '$app/environment';

	let shareMessage = '';
	let showShareMessage = false;

	async function shareRecipe(): Promise<void> {
		if (!browser) return;

		const currentUrl = window.location.href;

		try {
			if (navigator.share) {
				await navigator.share({
					title: "Baker's Percentage Recipe",
					text: 'Check out this bread recipe!',
					url: currentUrl
				});
			} else {
				await navigator.clipboard.writeText(currentUrl);
				shareMessage = 'Recipe URL copied to clipboard!';
				showShareMessage = true;
				setTimeout(() => {
					showShareMessage = false;
				}, 3000);
			}
		} catch {
			shareMessage = 'Copy this URL to share your recipe: ' + currentUrl;
			showShareMessage = true;
			setTimeout(() => {
				showShareMessage = false;
			}, 5000);
		}
	}
</script>

<button
	type="button"
	onclick={shareRecipe}
	class="share-btn"
	aria-label="Share recipe URL"
	title="Share recipe"
>
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
		/>
	</svg>
</button>

{#if showShareMessage}
	<div class="share-toast" role="status">{shareMessage}</div>
{/if}

<style>
	.share-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		flex-shrink: 0;
		border: 2px solid rgba(255, 255, 255, 0.45);
		background: transparent;
		color: #fff;
		cursor: pointer;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease;
	}

	.share-btn:hover {
		background: #fff;
		color: #000;
		border-color: #fff;
	}

	.share-btn:active {
		transform: translateY(1px);
	}

	.share-btn:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 2px;
	}

	.share-btn svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* Floating confirmation toast (sits above the bottom dock) */
	.share-toast {
		position: fixed;
		left: 50%;
		bottom: 6rem;
		transform: translateX(-50%);
		z-index: 60;
		max-width: calc(100vw - 2rem);
		padding: 0.625rem 1rem;
		background: #fff;
		color: #000;
		border: 2px solid #000;
		box-shadow: var(--shadow-hard);
		font-size: 0.875rem;
		font-weight: 500;
		text-align: center;
		animation: toastIn 0.18s ease-out;
	}

	@keyframes toastIn {
		from {
			opacity: 0;
			transform: translate(-50%, 8px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}
</style>
