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
		} catch (error) {
			shareMessage = 'Copy this URL to share your recipe: ' + currentUrl;
			showShareMessage = true;
			setTimeout(() => {
				showShareMessage = false;
			}, 5000);
		}
	}
</script>

<div class="relative">
	<button
		type="button"
		on:click={shareRecipe}
		class="flex w-full transform items-center justify-center rounded-lg border-2 border-blue-200 bg-blue-50 px-6 py-2 font-medium text-blue-700 transition-all duration-200 hover:scale-[1.02] hover:border-blue-300 hover:bg-blue-100 focus:ring-4 focus:ring-blue-200 focus:outline-none active:scale-[0.98]"
		aria-label="Share recipe URL"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-2 h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
			/>
		</svg>
		Share Recipe
	</button>

	{#if showShareMessage}
		<div
			class="absolute top-full right-0 left-0 mt-2 rounded-lg border border-green-200 bg-green-100 px-4 py-2 text-sm text-green-800 shadow-md"
		>
			{shareMessage}
		</div>
	{/if}
</div>