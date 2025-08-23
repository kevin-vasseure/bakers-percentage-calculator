<script lang="ts">
	import { authStore } from '$lib/stores/authStore';
	import { onMount } from 'svelte';

	export let onOpenAuth: ((event: { mode: 'signin' | 'signup' }) => void) | undefined = undefined;
	export let onOpenRecipes: (() => void) | undefined = undefined;

	let showDropdown = false;
	
	$: user = $authStore.user;
	$: loading = $authStore.loading;

	onMount(() => {
		authStore.initialize();
	});

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	function closeDropdown() {
		showDropdown = false;
	}

	function openAuthModal(mode: 'signin' | 'signup') {
		onOpenAuth?.({ mode });
		closeDropdown();
	}

	async function handleSignOut() {
		await authStore.signOut();
		closeDropdown();
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

<div class="relative">
	{#if loading}
		<div class="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
	{:else if user}
		<button
			type="button"
			on:click={toggleDropdown}
			class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white shadow-lg hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
		>
			{user.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : user.email?.[0]?.toUpperCase()}
		</button>

		{#if showDropdown}
			<div class="absolute right-0 top-10 z-50 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
				<div class="border-b border-gray-100 px-4 py-2">
					<p class="text-sm font-medium text-gray-900">
						{user.user_metadata?.full_name || 'User'}
					</p>
					<p class="text-xs text-gray-500">{user.email}</p>
				</div>
				
				<button
					type="button"
					class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
					on:click={() => onOpenRecipes?.()}
				>
					My Recipes
				</button>
				
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
				class="rounded-lg border border-amber-300 px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
			>
				Sign In
			</button>
			<button
				type="button"
				on:click={() => openAuthModal('signup')}
				class="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
			>
				Sign Up
			</button>
		</div>
	{/if}
</div>

<!-- Close dropdown when clicking outside -->
{#if showDropdown}
	<div 
		class="fixed inset-0 z-40" 
		on:click={closeDropdown}
		aria-hidden="true"
	></div>
{/if}