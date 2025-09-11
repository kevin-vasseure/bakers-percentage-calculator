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
		}

		// Require Turnstile for both signin and signup (if configured and not in dev)
		if (PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
			error = 'Please complete the security check';
			return;
		}

		loading = true;

		try {
			if (mode === 'signup') {
				const { error: signUpError } = await authStore.signUp(
					email,
					password,
					fullName,
					turnstileToken
				);
				if (signUpError) {
					error = signUpError.message;
				} else {
					message = 'Check your email for a confirmation link!';
				}
			} else {
				const { error: signInError } = await authStore.signIn(email, password, turnstileToken);
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
			onclick={closeModal}
			onkeydown={(e) => e.key === 'Enter' && closeModal()}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		></div>

		<!-- Modal content -->
		<div
			class="pointer-events-none fixed inset-0 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div class="pointer-events-auto relative w-full max-w-md border-2 border-black bg-white p-6">
				<div class="mb-6 text-center">
					<h2 id="modal-title" class="text-2xl font-bold text-gray-900">
						{mode === 'signin' ? 'Sign In' : 'Create Account'}
					</h2>
					<p class="mt-2 text-sm text-gray-600">
						{mode === 'signin' ? 'Welcome back!' : 'Join the baking community'}
					</p>
				</div>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					class="space-y-4"
				>
					{#if mode === 'signup'}
						<div>
							<label for="fullName" class="mb-1 block text-sm font-medium text-gray-700">
								Full Name (optional)
							</label>
							<input
								id="fullName"
								type="text"
								bind:value={fullName}
								class="w-full border-2 border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
								placeholder="Your full name"
							/>
						</div>
					{/if}

					<div>
						<label for="email" class="mb-1 block text-sm font-medium text-gray-700"> Email </label>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							class="w-full border-2 border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
							placeholder="your@email.com"
						/>
					</div>

					<div>
						<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							required
							class="w-full border-2 border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
							placeholder="Enter your password"
						/>
					</div>

					{#if mode === 'signup'}
						<div>
							<label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700">
								Confirm Password
							</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								required
								class="w-full border-2 border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
								placeholder="Confirm your password"
							/>
						</div>
					{/if}

					<!-- Security Check for both signin and signup -->
					{#if PUBLIC_TURNSTILE_SITE_KEY}
						<div>
							<div
								class="mb-2 block text-sm font-medium text-gray-700"
								role="group"
								aria-label="Security Check"
							>
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

					{#if error}
						<div class="border-2 border-black bg-white p-3 text-sm text-black">
							{error}
						</div>
					{/if}

					{#if message}
						<div class="border-2 border-black bg-gray-100 p-3 text-sm text-black">
							{message}
						</div>
					{/if}

					<button
						type="submit"
						disabled={loading}
						class="w-full border-2 border-black bg-black px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-white hover:text-black focus:ring-2 focus:ring-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
					</button>
				</form>

				<div class="mt-6 text-center">
					<button
						type="button"
						onclick={switchMode}
						class="text-sm text-black hover:text-gray-600 hover:underline"
					>
						{mode === 'signin'
							? "Don't have an account? Sign up"
							: 'Already have an account? Sign in'}
					</button>
				</div>

				<button
					type="button"
					onclick={closeModal}
					class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
					aria-label="Close modal"
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}
