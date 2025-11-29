import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    // Optimized: Query user_profiles with is_guide filter and fetch users in parallel
    // Using Promise.all for parallel execution
    const [profilesResult, usersResult] = await Promise.all([
      supabaseAdmin
        .from('user_profiles')
        .select('user_id, name, phone, address, profile_picture_url, experience_years, specialties, guidance_fees, created_at')
        .eq('is_guide', true)
        .gte('experience_years', 7)
        .order('experience_years', { ascending: false })
        .limit(100), // Limit results for performance
      // Pre-fetch all active farmers to avoid second query
      supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('role', 'farmer')
        .eq('is_active', true)
    ])

    if (profilesResult.error) throw profilesResult.error
    if (usersResult.error) throw usersResult.error

    const profilesData = profilesResult.data || []
    const usersData = usersResult.data || []

    if (profilesData.length === 0) {
      return NextResponse.json(
        { guides: [] },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      )
    }

    // Create lookup map for O(1) access
    const usersMap = new Map(usersData.map(u => [u.id, u]))

    // Transform data efficiently
    const guides = profilesData
      .filter(p => usersMap.has(p.user_id)) // Filter only active farmers
      .map((profile) => {
        const user = usersMap.get(profile.user_id)
        const experience_years = profile.experience_years || 0
        const guidance_fees = profile.guidance_fees
        
        return {
          id: profile.user_id,
          name: profile.name || 'Unknown',
          email: user?.email || '',
          address: profile.address || '',
          phone: profile.phone || '',
          photo: profile.profile_picture_url || null,
          experience: `${experience_years}+ years`,
          experience_years,
          guidanceFees: guidance_fees 
            ? `₹${Number(guidance_fees).toFixed(2)}/hour`
            : 'Contact for pricing',
          guidance_fees,
          specialties: Array.isArray(profile.specialties) ? profile.specialties : [],
        }
      })

    return NextResponse.json(
      { guides },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    )
  } catch (err) {
    console.error('Guides GET error', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
