import { SupabaseClient, Session, User } from '@supabase/supabase-js'
import { Database } from '$lib/database.types'

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
			session: Session | null
			user: User | null
		}
		interface PageData {
			session: Session | null
		}
		// interface PageState {}
		// interface Platform {}
	}

	// Turnstile global types
	interface Window {
		turnstile: {
			render: (element: HTMLElement, options: {
				sitekey: string;
				theme?: 'light' | 'dark' | 'auto';
				size?: 'normal' | 'compact';
				callback?: (token: string) => void;
				'error-callback'?: () => void;
				'expired-callback'?: () => void;
			}) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
		}
	}
}

export {};