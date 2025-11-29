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

const ALLOWED_CATEGORIES = ['vegetables','fruits','grains','pulses','spices','herbs','dairy','others']

function buildUpdatePayload(body) {
  const updates = {}
  if (typeof body.name === 'string' && body.name.trim().length >= 2) updates.name = body.name.trim()
  if (typeof body.description === 'string' && body.description.trim().length >= 10) updates.description = body.description.trim()
  if (body.price != null && Number.isFinite(Number(body.price)) && Number(body.price) > 0) updates.price = Number(body.price)
  if (typeof body.unit === 'string' && body.unit.trim().length > 0) updates.unit = body.unit
  if (body.quantity_available != null && Number.isFinite(Number(body.quantity_available)) && Number(body.quantity_available) >= 0) updates.quantity_available = Number(body.quantity_available)
  if (typeof body.category === 'string' && ALLOWED_CATEGORIES.includes(body.category)) updates.category = body.category
  if (typeof body.location === 'string' && body.location.trim().length >= 3) updates.location = body.location.trim()
  if (typeof body.is_organic === 'boolean') updates.is_organic = body.is_organic
  return updates
}

export async function PUT(request, { params }) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })

    // Ensure caller is the owner farmer
    const { data: product, error: fetchErr } = await supabaseAdmin
      .from('organic_products')
      .select('id, farmer_id')
      .eq('id', id)
      .single()
    if (fetchErr) throw fetchErr
    if (!product || product.farmer_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const updates = buildUpdatePayload(body)

    // optional main image update
    if (typeof body.image_base64 === 'string' && body.image_base64.startsWith('data:')) {
      try {
        const url = await uploadBase64Image(body.image_base64)
        updates.image_url = url
      } catch {}
    } else if (typeof body.image_url === 'string' && body.image_url.trim().length > 0) {
      updates.image_url = body.image_url.trim()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('organic_products')
      .update(updates)
      .eq('id', id)
      .select('id, name, description, price, unit, quantity_available, category, location, is_organic, image_url, is_active, updated_at')
      .single()
    if (updErr) throw updErr

    return NextResponse.json({ product: updated })
  } catch (err) {
    console.error('Products PUT error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })

    // Ensure owner
    const { data: product, error: fetchErr } = await supabaseAdmin
      .from('organic_products')
      .select('id, farmer_id')
      .eq('id', id)
      .single()
    if (fetchErr) throw fetchErr
    if (!product || product.farmer_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete: set is_active=false
    const { error: delErr } = await supabaseAdmin
      .from('organic_products')
      .update({ is_active: false })
      .eq('id', id)
    if (delErr) throw delErr

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Products DELETE error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}




