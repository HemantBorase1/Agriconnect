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

function validateProductPayload(payload) {
  const errors = []
  const {
    name,
    description,
    price,
    unit,
    quantity_available,
    category,
    location,
    is_organic,
  } = payload || {}

  if (!name || typeof name !== 'string' || name.trim().length < 2) errors.push('Invalid name')
  if (!description || typeof description !== 'string' || description.trim().length < 10) errors.push('Invalid description')
  const priceNum = Number(price)
  if (!Number.isFinite(priceNum) || priceNum <= 0) errors.push('Invalid price')
  if (!unit || typeof unit !== 'string') errors.push('Invalid unit')
  const qtyNum = Number(quantity_available)
  if (!Number.isFinite(qtyNum) || qtyNum < 0) errors.push('Invalid quantity_available')
  if (!category || !ALLOWED_CATEGORIES.includes(String(category))) errors.push('Invalid category')
  if (!location || typeof location !== 'string' || location.trim().length < 3) errors.push('Invalid location')
  if (typeof is_organic !== 'boolean') errors.push('Invalid is_organic')
  return { errors, priceNum, qtyNum }
}

export async function POST(request) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ensure caller is a farmer
    const { data: userRow, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, role, is_active')
      .eq('id', userId)
      .single()
    if (userErr) throw userErr
    if (!userRow?.is_active) return NextResponse.json({ error: 'User inactive' }, { status: 403 })
    if (userRow.role !== 'farmer') return NextResponse.json({ error: 'Only farmers can add products' }, { status: 403 })

    const body = await request.json().catch(() => ({}))
    const { errors, priceNum, qtyNum } = validateProductPayload(body)
    if (errors.length) return NextResponse.json({ error: errors.join(', ') }, { status: 400 })

    // Handle optional image: accept either direct URL or base64 data
    let mainImageUrl = null
    if (typeof body.image_base64 === 'string' && body.image_base64.startsWith('data:')) {
      try {
        mainImageUrl = await uploadBase64Image(body.image_base64)
      } catch (e) {
        // Fallback to provided URL if any
        mainImageUrl = typeof body.image_url === 'string' ? body.image_url : null
      }
    } else if (typeof body.image_url === 'string' && body.image_url.trim().length > 0) {
      mainImageUrl = body.image_url.trim()
    }

    const insertPayload = {
      farmer_id: userId,
      name: body.name.trim(),
      description: body.description.trim(),
      price: priceNum,
      unit: body.unit,
      quantity_available: qtyNum,
      category: body.category,
      location: body.location.trim(),
      is_organic: !!body.is_organic,
      image_url: mainImageUrl,
      is_active: true,
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('organic_products')
      .insert(insertPayload)
      .select('id, name, description, price, unit, quantity_available, category, location, is_organic, image_url, is_active, created_at')
      .single()
    if (insErr) throw insErr

    // Optional: insert additional images array
    let imagesInserted = []
    if (Array.isArray(body.images) && body.images.length > 0) {
      const imageRows = []
      for (let i = 0; i < body.images.length; i++) {
        const img = body.images[i]
        if (!img) continue
        let url = null
        if (typeof img.image_base64 === 'string' && img.image_base64.startsWith('data:')) {
          try {
            url = await uploadBase64Image(img.image_base64)
          } catch (e) {
            url = typeof img.image_url === 'string' ? img.image_url : null
          }
        } else if (typeof img.image_url === 'string') {
          url = img.image_url
        }
        if (!url) continue
        imageRows.push({
          product_id: inserted.id,
          image_url: url,
          alt_text: typeof img.alt_text === 'string' ? img.alt_text : null,
          display_order: Number.isFinite(Number(img.display_order)) ? Number(img.display_order) : i,
        })
      }
      if (imageRows.length > 0) {
        const { data: imgs, error: imgsErr } = await supabaseAdmin
          .from('product_images')
          .insert(imageRows)
          .select('id, image_url, alt_text, display_order')
        if (imgsErr) throw imgsErr
        imagesInserted = imgs || []
      }
    }

    return NextResponse.json({ product: inserted, images: imagesInserted }, { status: 201 })
  } catch (err) {
    console.error('Products POST error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}


