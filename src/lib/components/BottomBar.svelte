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
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<!-- Fixed Bottom Bar -->
<div class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
	<div class="flex items-center justify-between px-6 py-3">
		
		<!-- Recipes Button (left side) -->
		{#if user}
			<button
				type="button"
				on:click={() => onOpenRecipes?.()}
				class="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<span>My Recipes</span>
			</button>
		{:else}
			<div></div>
		{/if}

		<!-- User Menu (right side) -->
		<div class="relative">
			{#if loading}
				<div class="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
			{:else if user}
				<button
					type="button"
					on:click={toggleUserMenu}
					class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white shadow-lg hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
				>
					{user.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : user.email?.[0]?.toUpperCase()}
				</button>

				{#if showUserMenu}
					<div class="absolute right-0 bottom-12 z-50 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
						<div class="border-b border-gray-100 px-4 py-2">
							<p class="text-sm font-medium text-gray-900">
								{user.user_metadata?.full_name || 'User'}
							</p>
							<p class="text-xs text-gray-500">{user.email}</p>
						</div>
						
						<div class="border-t border-gray-100">
							<button
								type="button"
								on:click={handleSignOut}
								class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
						on:click={() => openAuthModal('signin')}
						class="rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						Sign In
					</button>
					<button
						type="button"
						on:click={() => openAuthModal('signup')}
						class="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
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
	<div 
		class="fixed inset-0 z-30" 
		on:click={closeUserMenu}
		aria-hidden="true"
	></div>
{/if}