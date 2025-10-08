import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { uploadBase64Image } from '@/lib/cloudinary'

async function getAuthUserId(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error) return null
  return data?.user?.id || null
}

export async function GET(request) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userRow, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, email, role, is_verified, is_active')
      .eq('id', userId)
      .single()

    if (userErr) throw userErr

    const { data: profileRow, error: profErr } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, name, phone, aadhaar_number, address, profile_picture_url, experience_years, specialties, guidance_fees, is_guide')
      .eq('user_id', userId)
      .single()

    if (profErr) throw profErr

    return NextResponse.json({ user: userRow, profile: profileRow })
  } catch (err) {
    console.error('Profile GET error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      name,
      address,
      profile_picture_url,
      experience_years,
      specialties, // comma-separated string or array
      guidance_fees,
    } = body || {}

    let uploadedUrl = null
    if (profile_picture_url && typeof profile_picture_url === 'string' && profile_picture_url.startsWith('data:')) {
      try {
        uploadedUrl = await uploadBase64Image(profile_picture_url)
      } catch (e) {
        console.warn('Cloudinary upload failed', e)
      }
    }

    // Fetch current role to enforce immutable role + guide rules
    const { data: userRow, error: userErr } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    if (userErr) throw userErr

    const isFarmer = userRow.role === 'farmer'
    const expYearsNum = Number.isFinite(Number(experience_years)) ? Number(experience_years) : null
    const isGuide = isFarmer && expYearsNum != null && expYearsNum >= 7

    const specialtiesArray = Array.isArray(specialties)
      ? specialties
      : (typeof specialties === 'string' && specialties.trim().length > 0
        ? specialties.split(',').map(s => s.trim()).filter(Boolean)
        : null)

    const updatePayload = {
      name: name ?? undefined,
      address: address ?? undefined,
      profile_picture_url: uploadedUrl ?? undefined,
      experience_years: expYearsNum,
      specialties: isGuide ? specialtiesArray : null,
      guidance_fees: isGuide && guidance_fees != null ? Number(guidance_fees) : null,
    }

    const { error: updErr } = await supabaseAdmin
      .from('user_profiles')
      .update(updatePayload)
      .eq('user_id', userId)

    if (updErr) throw updErr

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Profile PUT error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}


