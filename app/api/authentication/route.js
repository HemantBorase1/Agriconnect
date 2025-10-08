import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { uploadBase64Image } from '@/lib/cloudinary'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      userId,
      email,
      role,
      name,
      phone,
      aadhaar_number,
      address,
      profile_picture_url,
      experience_years,
      password,
    } = body || {}

    if (!userId || !email || !role || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload image (if provided as base64 preview)
    let uploadedUrl = null
    if (profile_picture_url && typeof profile_picture_url === 'string' && profile_picture_url.startsWith('data:')) {
      try {
        uploadedUrl = await uploadBase64Image(profile_picture_url)
      } catch (e) {
        console.warn('Cloudinary upload failed', e)
      }
    }

    // Insert into users table (custom app table, not auth table)
    let password_hash = 'managed-by-supabase-auth'
    try {
      const { default: bcrypt } = await import('bcryptjs')
      if (password) {
        password_hash = await bcrypt.hash(password, 10)
      }
    } catch {}

    const { error: userInsertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash,
        role,
        is_verified: false,
        is_active: true,
      })

    if (userInsertError && userInsertError.code !== '23505') { // ignore duplicates
      throw userInsertError
    }

    // Insert initial profile row
    const { error: profileInsertError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: userId,
        name,
        phone: phone || null,
        aadhaar_number: aadhaar_number || null,
        address: address || null,
        profile_picture_url: uploadedUrl || null,
        experience_years: Number.isFinite(Number(experience_years)) ? Number(experience_years) : null,
      })

    if (profileInsertError && profileInsertError.code !== '23505') {
      throw profileInsertError
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Bootstrap error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request) {
  // Mark user as verified in app tables after Supabase email confirmation webhook or client signal
  try {
    const body = await request.json()
    const { userId } = body || {}
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_verified: true })
      .eq('id', userId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Verification mark error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}


