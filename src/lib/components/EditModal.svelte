<script lang="ts">
	let {
		isOpen = false,
		value = '' as string | number,
		label = '',
		type = 'text' as 'text' | 'number',
		unit = '',
		onSave = (_value: string | number) => {},
		onClose = () => {}
	} = $props();

	let inputValue = $state(value);
	let inputElement = $state<HTMLInputElement>();

	$effect(() => {
		if (isOpen) {
			inputValue = value;
			setTimeout(() => {
				inputElement?.focus();
				inputElement?.select();
			}, 10);
		}
	});

	function handleSave() {
		onSave(inputValue);
		handleClose();
	}

	function handleClose() {
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSave();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			handleClose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}
</script>

{#if isOpen}
	<div class="edit-modal-backdrop" onclick={handleBackdropClick} role="presentation">
		<div class="edit-modal-container">
			<div class="modal-header">
				<h3 class="modal-title">{label}</h3>
			</div>
			<div class="modal-body">
				<div class="input-wrapper">
					<input
						bind:this={inputElement}
						bind:value={inputValue}
						{type}
						class="modal-input"
						onkeydown={handleKeydown}
						step={type === 'number' ? '0.1' : undefined}
						min={type === 'number' ? '0' : undefined}
					/>
					{#if unit}
						<span class="input-unit">{unit}</span>
					{/if}
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="modal-button modal-button--cancel" onclick={handleClose}>
					Cancel
				</button>
				<button type="button" class="modal-button modal-button--save" onclick={handleSave}>
					Save
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.edit-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 1rem;
	}

	.edit-modal-container {
		background-color: #ffffff;
		border: 2px solid #000;
		box-shadow: var(--shadow-hard-lg);
		max-width: 400px;
		width: 100%;
		animation: modalSlideIn 0.2s ease-out;
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translateY(-12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		padding: 1rem 1.5rem;
		background-color: #000;
	}

	.modal-title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #fff;
		margin: 0;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.input-wrapper {
		position: relative;
	}

	.modal-input {
		width: 100%;
		padding: 0.75rem;
		padding-right: 3rem;
		font-family: var(--font-mono);
		font-size: 1.125rem;
		border: 2px solid #000;
		outline: none;
		transition:
			box-shadow 0.15s ease,
			border-color 0.15s ease;
	}

	.modal-input:focus {
		border-color: #000;
		box-shadow: var(--shadow-hard);
	}

	.input-unit {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		font-family: var(--font-mono);
		font-size: 1rem;
		color: #6b7280;
		pointer-events: none;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 2px solid #000;
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.modal-button {
		padding: 0.625rem 1.25rem;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		border: 2px solid #000;
		transition:
			background-color 0.15s ease,
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.modal-button:active {
		transform: translate(2px, 2px);
		box-shadow: none !important;
	}

	.modal-button--cancel {
		background-color: #fff;
		color: #000;
	}

	.modal-button--cancel:hover {
		background-color: var(--hover-light);
	}

	.modal-button--save {
		background-color: #000;
		color: #fff;
		box-shadow: var(--shadow-hard);
	}

	.modal-button--save:hover {
		background-color: var(--hover-dark);
		transform: translate(-2px, -2px);
		box-shadow: var(--shadow-hard-lg);
	}

	@media (max-width: 640px) {
		.edit-modal-container {
			max-width: 100%;
			margin: 0 1rem;
		}

		.modal-input {
			font-size: 1rem;
		}
	}
</style>
