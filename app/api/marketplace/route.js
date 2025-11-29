import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const organicOnly = searchParams.get('organicOnly') === 'true'

    // Build query to get active products
    let query = supabaseAdmin
      .from('organic_products')
      .select('id, name, description, price, unit, quantity_available, category, location, is_organic, image_url, created_at, farmer_id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (organicOnly) {
      query = query.eq('is_organic', true)
    }

    if (search && search.trim().length > 0) {
      const searchTerm = search.trim()
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
    }

    const { data: productsData, error: productsError } = await query

    if (productsError) throw productsError

    if (!productsData || productsData.length === 0) {
      return NextResponse.json({ products: [] })
    }

    // Get unique farmer IDs
    const farmerIds = [...new Set(productsData.map(p => p.farmer_id))]

    // Fetch farmer profiles
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, name, phone, address, profile_picture_url, experience_years')
      .in('user_id', farmerIds)

    if (profilesError) throw profilesError

    // Fetch farmer emails from users table
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .in('id', farmerIds)

    if (usersError) throw usersError

    // Create lookup maps
    const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]))
    const usersMap = new Map((usersData || []).map(u => [u.id, u]))

    // Transform data to match frontend structure
    const products = productsData.map((product) => {
      const profile = profilesMap.get(product.farmer_id)
      const user = usersMap.get(product.farmer_id)

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        unit: product.unit,
        quantity_available: product.quantity_available,
        category: product.category,
        location: product.location,
        is_organic: product.is_organic,
        image_url: product.image_url,
        created_at: product.created_at,
        farmer: {
          name: profile?.name || 'Unknown',
          phone: profile?.phone || '',
          email: user?.email || '',
          address: profile?.address || '',
          profile_picture_url: profile?.profile_picture_url || null,
          experience_years: profile?.experience_years || null,
        },
      }
    })

    return NextResponse.json({ products })
  } catch (err) {
    console.error('Marketplace GET error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}

