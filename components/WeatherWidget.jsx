'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cloud, Droplets, Wind } from 'lucide-react'

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async ({ lat, lon }) => {
    setError(null)
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('lat', String(lat))
      params.set('lon', String(lon))
      const res = await fetch(`/api/weather?${params.toString()}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch weather')
      setWeather(data)
    } catch (e) {
      setWeather(null)
      setError(e?.message || 'Failed to fetch weather')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported in this browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        })
      },
      (geoErr) => {
        setLoading(false)
        setError(geoErr?.message || 'Unable to get current location')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [fetchWeather])

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Weather</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Weather</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {error || 'Unable to fetch weather data'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const temp =
    typeof weather.temperature === 'number'
      ? Math.round(weather.temperature)
      : '—'

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cloud className="h-5 w-5" />
          <span>Weather in {weather.location}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={`https://openweathermap.org/img/w/${weather.icon}.png`}
              alt={weather.description}
              className="w-12 h-12"
            />
            <div>
              <p className="text-2xl font-bold">{temp}°C</p>
              <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>
              {weather.humidity != null ? `${weather.humidity}%` : '—'} Humidity
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span>
              {weather.windSpeed != null ? `${weather.windSpeed} m/s` : '—'} Wind
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
