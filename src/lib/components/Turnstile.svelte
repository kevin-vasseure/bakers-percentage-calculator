<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let siteKey: string;
	export let onVerify: (token: string) => void;
	export let onError: () => void = () => {};
	export let theme: 'light' | 'dark' | 'auto' = 'auto';
	export let size: 'normal' | 'compact' = 'normal';

	let turnstileDiv: HTMLDivElement;
	let widgetId: string | null = null;

	onMount(() => {
		if (!browser || !window.turnstile) {
			console.error('Turnstile not loaded');
			return;
		}

		widgetId = window.turnstile.render(turnstileDiv, {
			sitekey: siteKey,
			theme: theme,
			size: size,
			callback: onVerify,
			'error-callback': onError,
			'expired-callback': () => {
				// Reset the widget when it expires
				if (widgetId) {
					window.turnstile.reset(widgetId);
				}
			}
		});

		return () => {
			if (widgetId && window.turnstile) {
				window.turnstile.remove(widgetId);
			}
		};
	});

	export function reset() {
		if (widgetId && window.turnstile) {
			window.turnstile.reset(widgetId);
		}
	}
</script>

<!-- Turnstile will render here -->
<div bind:this={turnstileDiv}></div>