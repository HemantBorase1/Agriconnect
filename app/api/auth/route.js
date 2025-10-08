import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request) {
  // Resend verification email using service role for higher reliability in server context
  try {
    const body = await request.json()
    const { email, redirectTo } = body || {}
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }
    const { error } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Resend verification error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}


