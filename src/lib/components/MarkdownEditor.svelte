<script lang="ts">
	import { Editor } from 'bytemd';
	import gfm from '@bytemd/plugin-gfm';

	let {
		value = '',
		placeholder = 'Write your recipe notes in markdown...',
		onchange = undefined as ((value: string) => void) | undefined
	} = $props();

	const plugins = [gfm()];

	function handleChange(e: CustomEvent) {
		value = e.detail.value;
		onchange?.(e.detail.value);
	}
</script>

<div class="markdown-editor-wrapper">
	<Editor {value} {plugins} {placeholder} on:change={handleChange} />
</div>

<style>
	.markdown-editor-wrapper {
		width: 100%;
		min-height: 12rem;
		border: 2px solid #d1d5db;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.markdown-editor-wrapper :global(.bytemd) {
		height: 100%;
		border: none;
	}

	.markdown-editor-wrapper :global(.bytemd-toolbar) {
		background-color: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		padding: 0.5rem;
	}

	.markdown-editor-wrapper :global(.bytemd-editor) {
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
		font-size: 0.875rem;
		padding: 1rem;
	}

	.markdown-editor-wrapper :global(.bytemd-preview) {
		padding: 1rem;
		max-width: none;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	/* Mobile responsive - stack editor and preview */
	@media (max-width: 768px) {
		.markdown-editor-wrapper :global(.bytemd-split) {
			flex-direction: column !important;
		}

		.markdown-editor-wrapper :global(.bytemd-editor),
		.markdown-editor-wrapper :global(.bytemd-preview) {
			min-height: 8rem;
		}
	}
</style>
