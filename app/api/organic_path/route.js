import { NextResponse } from 'next/server'

const ML_URL =
  process.env.ORGANIC_ML_API_URL || 'http://127.0.0.1:5000/predict'

export async function POST(req) {
  try {
    const raw = await req.json()

    console.log('[API] Incoming:', raw)

    // Keep all form fields; some ML models use extra context for detailed report.
    const state = String(raw?.state || '').trim()
    const district = String(raw?.district || '').trim()
    const crop = String(raw?.crop_name || '').trim()
    const city = String(raw?.city_village || '').trim()

    if (!state || !district || !crop || !city) {
      return NextResponse.json(
        { error: 'state, district, crop_name and city_village are required' },
        { status: 400 }
      )
    }

    const bodyForML = {
      ...raw,
      state,
      district,
      crop_name: crop,
      city_village: city,
      crop,
      city,
      village: city,
    }

   // console.log('[API] Sent to ML:', bodyForML)

    const response = await fetch(ML_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyForML),
    })

    const text = await response.text()
    let data = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { output: text }
    }

  //  console.log('[API] ML Response:', data)

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || 'ML error' },
        { status: response.status }
      )
    }

    const output =
      (typeof data?.output === 'string' && data.output.trim()) ||
      (typeof data?.organic_path === 'string' && data.organic_path.trim()) ||
      (typeof data?.result === 'string' && data.result.trim()) ||
      (typeof data?.message === 'string' && data.message.trim()) ||
      (typeof text === 'string' && text.trim()) ||
      ''

    // Return full data + text output for frontend
    return NextResponse.json({
      ...data,
      output: output || 'No response received from model',
    })

  } catch (error) {
    console.error('[API ERROR]:', error)

    return NextResponse.json(
      {
        error: 'Backend failed',
        detail: error.message,
      },
      { status: 500 }
    )
  }
}