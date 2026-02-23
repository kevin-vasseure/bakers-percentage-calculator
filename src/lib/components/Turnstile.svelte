<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let {
		siteKey,
		onVerify,
		onError = () => {},
		theme = 'auto',
		size = 'normal'
	}: {
		siteKey: string;
		onVerify: (token: string) => void;
		onError?: () => void;
		theme?: 'light' | 'dark' | 'auto';
		size?: 'normal' | 'compact';
	} = $props();

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