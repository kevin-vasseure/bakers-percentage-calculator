<script lang="ts">
	import { authStore } from '$lib/stores/authStore';
	import { onMount } from 'svelte';

	export let onOpenAuth: ((event: { mode: 'signin' | 'signup' }) => void) | undefined = undefined;
	export let onOpenRecipes: (() => void) | undefined = undefined;

	let showUserMenu = false;

	$: user = $authStore.user;
	$: loading = $authStore.loading;

	onMount(() => {
		authStore.initialize();
	});

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function closeUserMenu() {
		showUserMenu = false;
	}

	function openAuthModal(mode: 'signin' | 'signup') {
		onOpenAuth?.({ mode });
		closeUserMenu();
	}

	async function handleSignOut() {
		await authStore.signOut();
		closeUserMenu();
	}

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<!-- Fixed Bottom Bar -->
<div class="fixed right-0 bottom-0 left-0 z-40 border-t-2 border-black bg-white">
	<div class="flex items-center justify-between px-6 py-3">
		<!-- Recipes Button (left side) -->
		{#if user}
			<button
				type="button"
				onclick={() => onOpenRecipes?.()}
				class="flex items-center space-x-2 border-2 border-black bg-black px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black focus:ring-2 focus:ring-black focus:outline-none"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<span>My Recipes</span>
			</button>
		{:else}
			<div></div>
		{/if}

		<!-- User Menu (right side) -->
		<div class="relative">
			{#if loading}
				<div class="h-10 w-10 animate-pulse border-2 border-gray-300 bg-gray-200"></div>
			{:else if user}
				<button
					type="button"
					onclick={toggleUserMenu}
					class="flex h-10 w-10 items-center justify-center border-2 border-black bg-black text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black focus:ring-2 focus:ring-black focus:outline-none"
				>
					{user.user_metadata?.full_name
						? getInitials(user.user_metadata.full_name)
						: user.email?.[0]?.toUpperCase()}
				</button>

				{#if showUserMenu}
					<div class="absolute right-0 bottom-12 z-50 w-48 border-2 border-black bg-white py-1">
						<div class="border-b-2 border-black px-4 py-2">
							<p class="text-sm font-medium text-gray-900">
								{user.user_metadata?.full_name || 'User'}
							</p>
							<p class="text-xs text-gray-500">{user.email}</p>
						</div>

						<div class="border-t-2 border-black">
							<button
								type="button"
								onclick={handleSignOut}
								class="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100"
							>
								Sign Out
							</button>
						</div>
					</div>
				{/if}
			{:else}
				<div class="flex space-x-2">
					<button
						type="button"
						onclick={() => openAuthModal('signin')}
						class="border-2 border-black px-3 py-2 text-sm font-medium text-black hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none"
					>
						Sign In
					</button>
					<button
						type="button"
						onclick={() => openAuthModal('signup')}
						class="border-2 border-black bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-white hover:text-black focus:ring-2 focus:ring-black focus:outline-none"
					>
						Sign Up
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Close user menu when clicking outside -->
{#if showUserMenu}
	<div class="fixed inset-0 z-30" onclick={closeUserMenu} aria-hidden="true"></div>
{/if}
