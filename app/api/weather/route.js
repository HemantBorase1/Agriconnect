import { NextResponse } from 'next/server'

function getOpenWeatherApiKey() {
  return (
    process.env.OPENWEATHER_API_KEY ||
    process.env.OPENWEATHER_KEY ||
    process.env.WEATHER_API_KEY ||
    null
  )
}

function buildWeatherPayload(openWeatherData) {
  const weather0 = Array.isArray(openWeatherData?.weather) ? openWeatherData.weather[0] : null

  return {
    location: openWeatherData?.name || 'Unknown',
    temperature: typeof openWeatherData?.main?.temp === 'number' ? openWeatherData.main.temp : null,
    description: weather0?.description || '',
    humidity: typeof openWeatherData?.main?.humidity === 'number' ? openWeatherData.main.humidity : null,
    windSpeed: typeof openWeatherData?.wind?.speed === 'number' ? openWeatherData.wind.speed : null,
    icon: weather0?.icon || '01d',
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const lat = url.searchParams.get('lat')
    const lon = url.searchParams.get('lon')

    const apiKey = getOpenWeatherApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENWEATHER_API_KEY in environment variables' },
        { status: 500 }
      )
    }

    const units = 'metric'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      // Build URL from scratch so we don't accidentally keep a default city (ex: q=London)
      let openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=${units}&appid=${encodeURIComponent(
        apiKey
      )}`

      if (city && city.trim().length > 0) {
        openWeatherUrl += `&q=${encodeURIComponent(city.trim())}`
      } else if (lat && lon) {
        const latNum = Number(lat)
        const lonNum = Number(lon)
        if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
          return NextResponse.json(
            { error: 'Invalid lat/lon parameters' },
            { status: 400 }
          )
        }
        openWeatherUrl += `&lat=${latNum}&lon=${lonNum}`
      } else {
        return NextResponse.json(
          { error: 'Provide either "city" or "lat" and "lon"' },
          { status: 400 }
        )
      }

      const res = await fetch(openWeatherUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const message =
          data?.message ||
          `OpenWeather request failed with status ${res.status}`
        return NextResponse.json({ error: message }, { status: res.status || 500 })
      }

      return NextResponse.json(buildWeatherPayload(data), {
        headers: { 'Cache-Control': 'no-store, must-revalidate' },
      })
    } finally {
      clearTimeout(timeout)
    }
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'Internal error' },
      { status: 500 }
    )
  }
}

