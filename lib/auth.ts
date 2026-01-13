'use server'

import { cookies } from 'next/headers'
import { supabase } from './supabase'

/**
 * Sign in admin user
 */
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'ئیمەیڵ یان وشەی نهێنی هەڵەیە' }
    }

    if (data.session) {
        // Store session in cookie
        const cookieStore = await cookies()
        cookieStore.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        cookieStore.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })
    }

    return { success: true }
}

/**
 * Sign out admin user
 */
export async function signOut() {
    const cookieStore = await cookies()
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')

    await supabase.auth.signOut()
    return { success: true }
}

/**
 * Get current session (server-side)
 */
export async function getSession() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
        return null
    }

    const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    })

    if (error || !data.session) {
        return null
    }

    return data.session
}

/**
 * Require authentication (use in server components)
 * Returns session or null
 */
export async function requireAuth() {
    return await getSession()
}
