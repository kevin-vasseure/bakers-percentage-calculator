<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { recipesStore } from '$lib/stores/recipesStore';
	import { currentRecipeStore } from '$lib/stores/currentRecipeStore';
	import {
		requestWakeLock,
		releaseWakeLock,
		isSupported,
		keepAwake
	} from '$lib/utils/wakeLock';

	let {
		onOpenRecipes = undefined as (() => void) | undefined,
		onOpenHelp = undefined as (() => void) | undefined
	} = $props();

	let count = $derived($recipesStore.recipes.length);
	let viewMode = $derived($currentRecipeStore.viewMode);

	// --- Wake lock ---
	let wakeSupported = $state(false);

	onMount(() => {
		wakeSupported = isSupported();
		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible' && $keepAwake) requestWakeLock();
		};
		document.addEventListener('visibilitychange', onVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', onVisibilityChange);
			releaseWakeLock();
		};
	});

	$effect(() => {
		if (!browser) return;
		if ($keepAwake) requestWakeLock();
		else releaseWakeLock();
	});

	function toggleViewMode() {
		currentRecipeStore.toggleViewMode();
	}

	function toggleWakeLock() {
		keepAwake.set(!$keepAwake);
	}

	// --- Share ---
	let shareMessage = $state('');
	let showShareMessage = $state(false);

	async function shareRecipe() {
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
				setTimeout(() => (showShareMessage = false), 3000);
			}
		} catch {
			shareMessage = 'Copy this URL to share your recipe: ' + currentUrl;
			showShareMessage = true;
			setTimeout(() => (showShareMessage = false), 5000);
		}
	}
</script>

<!-- Floating bottom dock: icon-only controls with hover tooltips -->
<div class="dock-wrap">
	<div class="dock">
		<button
			type="button"
			class="dock-btn"
			onclick={toggleViewMode}
			aria-label={viewMode ? 'Switch to edit mode' : 'Switch to view mode'}
			title={viewMode ? 'Edit recipe' : 'View recipe'}
		>
			{#if viewMode}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					/>
				</svg>
			{/if}
		</button>

		<button
			type="button"
			class="dock-btn"
			onclick={() => onOpenRecipes?.()}
			aria-label="My recipes"
			title="My recipes"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<span class="dock-count" class:dock-count--empty={count === 0}>{count}</span>
		</button>

		<button
			type="button"
			class="dock-btn"
			onclick={shareRecipe}
			aria-label="Share recipe"
			title="Share recipe"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
				/>
			</svg>
		</button>

		{#if wakeSupported}
			<button
				type="button"
				class="dock-btn"
				class:active={$keepAwake}
				onclick={toggleWakeLock}
				aria-pressed={$keepAwake}
				aria-label={$keepAwake ? 'Screen stays awake (tap to allow sleep)' : 'Keep screen awake'}
				title={$keepAwake ? 'Screen stays awake' : 'Keep screen awake'}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="4" />
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
					/>
				</svg>
			</button>
		{/if}

		<button
			type="button"
			class="dock-btn"
			onclick={() => onOpenHelp?.()}
			aria-label="How to use this calculator"
			title="Help"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="9" />
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9.5 9a2.5 2.5 0 014.5 1.5c0 1.5-2 2-2 3"
				/>
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 17h.01" />
			</svg>
		</button>
	</div>
</div>

{#if showShareMessage}
	<div class="share-toast" role="status">{shareMessage}</div>
{/if}

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
		position: relative;
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 0.875rem 0.5rem;
		background: transparent;
		color: #000;
		border: none;
		cursor: pointer;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	.dock-btn:not(:last-child) {
		border-right: 2px solid #000;
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

	.dock-btn svg {
		width: 1.375rem;
		height: 1.375rem;
	}

	/* Wake-lock active state */
	.dock-btn.active {
		background: var(--accent);
		color: var(--accent-ink);
	}

	.dock-btn.active:hover {
		background: #e0b30f;
	}

	.dock-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.3rem;
		background: var(--accent);
		color: var(--accent-ink);
		border: 2px solid #000;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1;
	}

	.dock-count--empty {
		background: #e5e5e0;
		color: #6b6b66;
	}

	/* Larger screens: collapse into a compact centered cluster */
	@media (min-width: 481px) {
		.dock-wrap {
			bottom: 1.5rem;
		}
		.dock {
			width: auto;
		}
		.dock-btn {
			flex: 0 0 auto;
			padding: 0.75rem 1.1rem;
		}
	}

	/* Floating confirmation toast for share (sits above the dock) */
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
