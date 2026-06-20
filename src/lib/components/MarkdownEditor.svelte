<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { browser } from '$app/environment';

	let {
		value = '',
		placeholder = 'Write your recipe notes in markdown...',
		onchange = undefined as ((value: string) => void) | undefined
	} = $props();

	let showPreview = $state(false);

	// Render markdown to sanitized HTML. Recipes can be loaded from a shared
	// URL (untrusted input), so the output must be sanitized before injection.
	// DOMPurify needs a DOM, and the preview only ever renders client-side, so
	// the computation is guarded to the browser.
	let renderedHtml = $derived.by(() => {
		if (!browser) return '';
		const raw = marked.parse(value ?? '', { gfm: true, breaks: true }) as string;
		return DOMPurify.sanitize(raw);
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		onchange?.(target.value);
	}
</script>

<div class="markdown-editor-wrapper">
	<div class="md-toolbar">
		<button
			type="button"
			class="md-tab"
			class:active={!showPreview}
			onclick={() => (showPreview = false)}
		>
			Write
		</button>
		<button
			type="button"
			class="md-tab"
			class:active={showPreview}
			onclick={() => (showPreview = true)}
		>
			Preview
		</button>
	</div>

	{#if showPreview}
		{#if value?.trim()}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized with DOMPurify above -->
			<div class="md-preview">{@html renderedHtml}</div>
		{:else}
			<div class="md-preview md-empty">Nothing to preview yet.</div>
		{/if}
	{:else}
		<textarea class="md-textarea" {value} {placeholder} oninput={handleInput} spellcheck="false"
		></textarea>
	{/if}
</div>

<style>
	.markdown-editor-wrapper {
		width: 100%;
		border: 2px solid #d1d5db;
		border-radius: 0.5rem;
		overflow: hidden;
		background-color: #fff;
	}

	.md-toolbar {
		display: flex;
		gap: 0.25rem;
		background-color: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		padding: 0.5rem;
	}

	.md-tab {
		padding: 0.25rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #6b7280;
		border-radius: 0.375rem;
		transition:
			background-color 0.15s,
			color 0.15s;
	}

	.md-tab:hover {
		color: #111827;
	}

	.md-tab.active {
		background-color: #111827;
		color: #fff;
	}

	.md-textarea {
		display: block;
		width: 100%;
		min-height: 12rem;
		padding: 1rem;
		border: none;
		outline: none;
		resize: vertical;
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #111827;
	}

	.md-preview {
		min-height: 12rem;
		padding: 1rem;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #111827;
		overflow-wrap: break-word;
	}

	.md-empty {
		color: #9ca3af;
		font-style: italic;
	}

	/* Markdown content styling */
	.md-preview :global(h1),
	.md-preview :global(h2),
	.md-preview :global(h3) {
		font-weight: 700;
		line-height: 1.25;
		margin: 1rem 0 0.5rem;
	}

	.md-preview :global(h1) {
		font-size: 1.5rem;
	}

	.md-preview :global(h2) {
		font-size: 1.25rem;
	}

	.md-preview :global(h3) {
		font-size: 1.0625rem;
	}

	.md-preview :global(p) {
		margin: 0.5rem 0;
	}

	.md-preview :global(ul),
	.md-preview :global(ol) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.md-preview :global(ul) {
		list-style: disc;
	}

	.md-preview :global(ol) {
		list-style: decimal;
	}

	.md-preview :global(li) {
		margin: 0.25rem 0;
	}

	.md-preview :global(blockquote) {
		margin: 0.75rem 0;
		padding-left: 1rem;
		border-left: 3px solid #d1d5db;
		color: #4b5563;
	}

	.md-preview :global(code) {
		font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
		font-size: 0.85em;
		background-color: #f3f4f6;
		padding: 0.1em 0.3em;
		border-radius: 0.25rem;
	}

	.md-preview :global(pre) {
		background-color: #f3f4f6;
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		overflow-x: auto;
		margin: 0.75rem 0;
	}

	.md-preview :global(pre code) {
		background-color: transparent;
		padding: 0;
	}

	.md-preview :global(a) {
		color: #2563eb;
		text-decoration: underline;
	}

	.md-preview :global(table) {
		border-collapse: collapse;
		margin: 0.75rem 0;
		width: 100%;
	}

	.md-preview :global(th),
	.md-preview :global(td) {
		border: 1px solid #d1d5db;
		padding: 0.375rem 0.625rem;
		text-align: left;
	}

	.md-preview :global(th) {
		background-color: #f9fafb;
		font-weight: 600;
	}

	.md-preview :global(hr) {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 1rem 0;
	}

	.md-preview :global(img) {
		max-width: 100%;
		height: auto;
	}
</style>
