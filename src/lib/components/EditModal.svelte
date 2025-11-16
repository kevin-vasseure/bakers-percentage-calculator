<script lang="ts">
	export let isOpen = false;
	export let value: string | number = '';
	export let label: string = '';
	export let type: 'text' | 'number' = 'text';
	export let unit: string = '';
	export let onSave: (value: string | number) => void = () => {};
	export let onClose: () => void = () => {};

	let inputValue = value;
	let inputElement: HTMLInputElement;

	$: if (isOpen) {
		inputValue = value;
		// Focus input when modal opens
		setTimeout(() => {
			inputElement?.focus();
			inputElement?.select();
		}, 10);
	}

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
	<div class="edit-modal-backdrop" on:click={handleBackdropClick} role="presentation">
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
						on:keydown={handleKeydown}
						step={type === 'number' ? '0.1' : undefined}
						min={type === 'number' ? '0' : undefined}
					/>
					{#if unit}
						<span class="input-unit">{unit}</span>
					{/if}
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="modal-button modal-button--cancel" on:click={handleClose}>
					Cancel
				</button>
				<button type="button" class="modal-button modal-button--save" on:click={handleSave}>
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
		border-radius: 0.5rem;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		max-width: 400px;
		width: 100%;
		animation: modalSlideIn 0.2s ease-out;
	}

	@keyframes modalSlideIn {
		from {
			transform: translateY(-20px) scale(0.95);
		}
		to {
			transform: translateY(0) scale(1);
		}
	}

	.modal-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
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
		font-size: 1.125rem;
		border: 2px solid #d1d5db;
		border-radius: 0.375rem;
		outline: none;
		transition: border-color 0.2s;
	}

	.modal-input:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.input-unit {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1rem;
		color: #6b7280;
		pointer-events: none;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.modal-button {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.modal-button--cancel {
		background-color: #f3f4f6;
		color: #374151;
	}

	.modal-button--cancel:hover {
		background-color: #e5e7eb;
	}

	.modal-button--save {
		background-color: #3b82f6;
		color: white;
	}

	.modal-button--save:hover {
		background-color: #2563eb;
	}

	@media (max-width: 640px) {
		.edit-modal-container {
			max-width: 100%;
			margin: 0 1rem;
		}

		.modal-title {
			font-size: 1rem;
		}

		.modal-input {
			font-size: 1rem;
		}
	}
</style>
