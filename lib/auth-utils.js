import { supabase } from './supabase'

/**
 * Check if user is authenticated and email is verified
 * @returns {Promise<{isAuthenticated: boolean, session: object|null}>}
 */
export async function checkAuth() {
  try {
    const { data: session, error } = await supabase.auth.getSession()
    
    if (error || !session?.session) {
      return { isAuthenticated: false, session: null }
    }

    const token = session.session.access_token
    const emailVerified = !!session.session.user?.email_confirmed_at

    if (!token || !emailVerified) {
      return { isAuthenticated: false, session: null }
    }

    return { isAuthenticated: true, session: session.session }
  } catch (error) {
    console.error('Auth check error:', error)
    return { isAuthenticated: false, session: null }
  }
}

/**
 * Get authenticated user ID
 * @returns {Promise<string|null>}
 */
export async function getAuthUserId() {
  const { isAuthenticated, session } = await checkAuth()
  return isAuthenticated ? session?.user?.id || null : null
}






