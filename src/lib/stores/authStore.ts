import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { browser } from '$app/environment';

export interface AuthState {
	user: User | null;
	session: Session | null;
	loading: boolean;
}

const initialState: AuthState = {
	user: null,
	session: null,
	loading: true
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		
		// Initialize auth state
		initialize: async () => {
			if (!browser) return;
			
			try {
				const { data: { session } } = await supabase.auth.getSession();
				set({
					user: session?.user || null,
					session,
					loading: false
				});

				// Listen for auth changes
				supabase.auth.onAuthStateChange((_event, session) => {
					set({
						user: session?.user || null,
						session,
						loading: false
					});
				});
			} catch (error) {
				console.error('Error initializing auth:', error);
				set({ user: null, session: null, loading: false });
			}
		},

		// Sign up with email and password
		signUp: async (email: string, password: string, fullName?: string) => {
			update(state => ({ ...state, loading: true }));
			
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName || ''
					}
				}
			});

			update(state => ({ ...state, loading: false }));
			return { data, error };
		},

		// Sign in with email and password
		signIn: async (email: string, password: string) => {
			update(state => ({ ...state, loading: true }));
			
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			update(state => ({ ...state, loading: false }));
			return { data, error };
		},

		// Sign out
		signOut: async () => {
			update(state => ({ ...state, loading: true }));
			
			const { error } = await supabase.auth.signOut();
			
			if (!error) {
				set({ user: null, session: null, loading: false });
			} else {
				update(state => ({ ...state, loading: false }));
			}
			
			return { error };
		},

		// Reset password
		resetPassword: async (email: string) => {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`
			});
			return { error };
		},

		// Update password
		updatePassword: async (newPassword: string) => {
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			});
			return { error };
		}
	};
}

export const authStore = createAuthStore();