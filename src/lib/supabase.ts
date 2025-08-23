import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { browser } from '$app/environment'
import type { Database } from './database.types'

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true
	}
})

// Helper function to check if user is authenticated
export function isAuthenticated() {
	if (!browser) return false
	return supabase.auth.getSession().then(({ data: { session } }) => !!session)
}

// Helper function to get current user
export async function getCurrentUser() {
	if (!browser) return null
	const { data: { user } } = await supabase.auth.getUser()
	return user
}