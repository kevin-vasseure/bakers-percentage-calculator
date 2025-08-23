<script lang="ts">
	import { authStore } from '$lib/stores/authStore';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import Turnstile from './Turnstile.svelte';

	export let isOpen = false;
	export let mode: 'signin' | 'signup' = 'signin';
	export let onClose: (() => void) | undefined = undefined;

	let email = '';
	let password = '';
	let fullName = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';
	let message = '';
	let turnstileToken = '';
	let turnstileRef: Turnstile;

	function closeModal() {
		isOpen = false;
		onClose?.();
		resetForm();
	}

	function resetForm() {
		email = '';
		password = '';
		fullName = '';
		confirmPassword = '';
		error = '';
		message = '';
		loading = false;
		turnstileToken = '';
		turnstileRef?.reset();
	}

	function switchMode() {
		mode = mode === 'signin' ? 'signup' : 'signin';
		resetForm();
	}

	async function handleSubmit() {
		error = '';
		message = '';

		if (!email || !password) {
			error = 'Email and password are required';
			return;
		}

		if (mode === 'signup') {
			if (password !== confirmPassword) {
				error = 'Passwords do not match';
				return;
			}
			if (password.length < 6) {
				error = 'Password must be at least 6 characters';
				return;
			}
			if (!turnstileToken) {
				error = 'Please complete the security check';
				return;
			}
		}

		loading = true;

		try {
			if (mode === 'signup') {
				const { error: signUpError } = await authStore.signUp(email, password, fullName);
				if (signUpError) {
					error = signUpError.message;
				} else {
					message = 'Check your email for a confirmation link!';
				}
			} else {
				const { error: signInError } = await authStore.signIn(email, password);
				if (signInError) {
					error = signInError.message;
				} else {
					closeModal();
				}
			}
		} catch (err) {
			error = 'An unexpected error occurred';
			console.error('Auth error:', err);
		} finally {
			loading = false;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	function handleTurnstileVerify(token: string) {
		turnstileToken = token;
		error = ''; // Clear any previous captcha errors
	}

	function handleTurnstileError() {
		turnstileToken = '';
		error = 'Security check failed. Please try again.';
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if isOpen}
	<div class="fixed inset-0 z-50">
		<!-- Black overlay -->
		<div 
			class="fixed inset-0 bg-black opacity-50"
			on:click={closeModal}
			on:keydown={(e) => e.key === 'Enter' && closeModal()}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		></div>
		
		<!-- Modal content -->
		<div 
			class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl pointer-events-auto relative">
			<div class="mb-6 text-center">
				<h2 id="modal-title" class="text-2xl font-bold text-gray-900">
					{mode === 'signin' ? 'Sign In' : 'Create Account'}
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					{mode === 'signin' ? 'Welcome back!' : 'Join the baking community'}
				</p>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				{#if mode === 'signup'}
					<div>
						<label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">
							Full Name (optional)
						</label>
						<input
							id="fullName"
							type="text"
							bind:value={fullName}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
							placeholder="Your full name"
						/>
					</div>
				{/if}

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
						placeholder="your@email.com"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						Password
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
						placeholder="Enter your password"
					/>
				</div>

				{#if mode === 'signup'}
					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
							Confirm Password
						</label>
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
							placeholder="Confirm your password"
						/>
					</div>

					<!-- Security Check -->
					{#if PUBLIC_TURNSTILE_SITE_KEY}
						<div>
							<div class="block text-sm font-medium text-gray-700 mb-2" role="group" aria-label="Security Check">
								Security Check
							</div>
							<Turnstile 
								bind:this={turnstileRef}
								siteKey={PUBLIC_TURNSTILE_SITE_KEY}
								onVerify={handleTurnstileVerify}
								onError={handleTurnstileError}
								theme="light"
								size="normal"
							/>
						</div>
					{/if}
				{/if}

				{#if error}
					<div class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
						{error}
					</div>
				{/if}

				{#if message}
					<div class="rounded-lg bg-green-50 p-3 text-sm text-green-700">
						{message}
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
				</button>
			</form>

			<div class="mt-6 text-center">
				<button
					type="button"
					on:click={switchMode}
					class="text-sm text-amber-600 hover:text-amber-700 hover:underline"
				>
					{mode === 'signin' 
						? "Don't have an account? Sign up" 
						: 'Already have an account? Sign in'}
				</button>
			</div>

			<button
				type="button"
				on:click={closeModal}
				class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
				aria-label="Close modal"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			</div>
		</div>
	</div>
{/if}