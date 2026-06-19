<script lang="ts">
	let { isOpen = $bindable(false), onClose = undefined as (() => void) | undefined } = $props();

	const steps = [
		{
			title: 'Edit Ingredient Names',
			body: 'Click on any ingredient name to edit it. Press Enter or click outside to save.'
		},
		{
			title: 'Set Your Flour Base',
			body: 'Check the "Flour" box to designate your reference flour (typically 100%).'
		},
		{
			title: 'Auto-Calculate',
			body: 'Enter either a percentage or a weight — the other value updates automatically.'
		},
		{
			title: 'Scale by Weight or Portions',
			body: 'Click the total weight to resize the whole recipe. Set the number of portions with the stepper, then edit the "per portion" weight to scale to a target serving size.'
		},
		{
			title: 'Reorder & Manage',
			body: 'Drag ingredients by the handle (≡) to reorder them. Add new ingredients or remove existing ones from the row controls.'
		},
		{
			title: 'Save & Share',
			body: 'Your recipe is kept in the URL automatically — tap the share icon (top-right) to copy the link. Use "My Recipes" to save recipes in your browser.'
		}
	];

	function close() {
		isOpen = false;
		onClose?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
	<div class="fixed inset-0 z-50">
		<div
			class="fixed inset-0 bg-black opacity-50"
			onclick={close}
			onkeydown={(e) => e.key === 'Enter' && close()}
			role="button"
			tabindex="0"
			aria-label="Close help"
		></div>

		<div
			class="pointer-events-none fixed inset-0 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="help-modal-title"
		>
			<div
				class="pointer-events-auto flex max-h-[85vh] w-full max-w-2xl flex-col border-2 border-black bg-white"
				style="box-shadow: var(--shadow-hard-lg);"
			>
				<!-- Header -->
				<div class="flex items-center justify-between border-b-2 border-black bg-black px-6 py-4">
					<h2
						id="help-modal-title"
						class="flex items-center text-lg font-extrabold tracking-wide text-white uppercase"
					>
						<span class="mr-2">💡</span>
						How to Use This Calculator
					</h2>
					<button
						type="button"
						onclick={close}
						class="p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
						aria-label="Close help"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Body -->
				<div class="overflow-y-auto p-6">
					<div class="grid gap-5 md:grid-cols-2">
						{#each steps as step, i}
							<div class="flex items-start">
								<div
									class="mt-0.5 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center bg-black text-sm font-bold text-white"
								>
									{i + 1}
								</div>
								<div>
									<h3 class="mb-1 font-semibold text-gray-800">{step.title}</h3>
									<p class="text-sm text-gray-600">{step.body}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
