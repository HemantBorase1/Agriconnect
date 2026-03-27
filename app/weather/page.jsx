'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Cloud, 
  Droplets, 
  Wind, 
  Thermometer, 
  Sun, 
  CloudRain, 
  MapPin,
  RefreshCw,
  Search,
  Loader2
} from 'lucide-react';

function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [citySearch, setCitySearch] = useState('');

  const fetchWeather = async ({ city, lat, lon } = {}) => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams()
      if (city && city.trim().length > 0) params.set('city', city.trim())
      if (lat != null && lon != null) {
        params.set('lat', String(lat))
        params.set('lon', String(lon))
      }

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
  }

  const getWeatherIcon = (iconCode) => {
    if (iconCode.includes('01')) return <Sun className="h-12 w-12 text-yellow-500" />;
    if (iconCode.includes('02') || iconCode.includes('03')) return <Cloud className="h-12 w-12 text-gray-500" />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="h-12 w-12 text-blue-500" />;
    return <Cloud className="h-12 w-12 text-gray-500" />;
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return 'text-red-600';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-green-600';
    return 'text-blue-600';
  };

  const getFarmingAdvice = (weather) => {
    const temp = weather.temperature;
    const humidity = weather.humidity;
    const description = weather.description.toLowerCase();

    if (description.includes('rain')) {
      return {
        title: 'Rainy Weather Advice',
        tips: [
          'Ensure proper drainage in fields',
          'Cover sensitive crops if possible',
          'Avoid fertilizer application',
          'Monitor for fungal diseases'
        ],
        icon: <CloudRain className="h-6 w-6 text-blue-600" />
      };
    }

    if (temp > 35) {
      return {
        title: 'Hot Weather Advice',
        tips: [
          'Increase irrigation frequency',
          'Provide shade for sensitive crops',
          'Harvest early morning or evening',
          'Monitor for heat stress in plants'
        ],
        icon: <Sun className="h-6 w-6 text-red-600" />
      };
    }

    if (humidity > 80) {
      return {
        title: 'High Humidity Advice',
        tips: [
          'Improve air circulation',
          'Watch for fungal diseases',
          'Reduce watering frequency',
          'Apply preventive fungicides'
        ],
        icon: <Droplets className="h-6 w-6 text-blue-600" />
      };
    }

    return {
      title: 'General Farming Advice',
      tips: [
        'Good conditions for most crops',
        'Continue regular watering schedule',
        'Monitor soil moisture levels',
        'Perfect time for field activities'
      ],
      icon: <Sun className="h-6 w-6 text-green-600" />
    };
  };

  const handleSearch = () => {
    if (!citySearch.trim()) return
    fetchWeather({ city: citySearch })
  }

  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser')
      return
    }

    setError(null)
    setLoading(true)
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
  }

  useEffect(() => {
    // Default location so the UI isn't empty on first load.
    // Change this city if you want a different default.
    fetchWeather({ city: 'New Delhi' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Weather Information</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get weather data and farming advice based on current conditions
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for a city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              onClick={handleCurrentLocation}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>
                {loading ? 'Fetching...' : 'Current Location'}
              </span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {weather && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Weather */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Current Weather in {weather.location}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {getWeatherIcon(weather.icon)}
                    <div>
                      <div className={`text-4xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                        {weather.temperature}°C
                      </div>
                      <div className="text-gray-600 capitalize">{weather.description}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Humidity</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{weather.humidity}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wind className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Wind Speed</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">{weather.windSpeed} m/s</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Farming Advice */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getFarmingAdvice(weather).icon}
                  <span>{getFarmingAdvice(weather).title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getFarmingAdvice(weather).tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading && !weather && (
          <div className="flex items-center justify-center py-10 text-gray-600">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading weather...</span>
          </div>
        )}

        {/* Weather Tips */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <span>Sunny Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Perfect for harvesting</li>
                <li>• Increase irrigation</li>
                <li>• Monitor for heat stress</li>
                <li>• Apply mulch to retain moisture</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CloudRain className="h-5 w-5 text-blue-500" />
                <span>Rainy Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Ensure proper drainage</li>
                <li>• Avoid field operations</li>
                <li>• Watch for fungal diseases</li>
                <li>• Cover sensitive crops</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wind className="h-5 w-5 text-gray-500" />
                <span>Windy Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Secure loose materials</li>
                <li>• Avoid spraying pesticides</li>
                <li>• Check plant supports</li>
                <li>• Monitor soil moisture</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}

export default WeatherPage;
