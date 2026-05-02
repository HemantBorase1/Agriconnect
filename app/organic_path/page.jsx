'use client'

import React, { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Sprout } from 'lucide-react'

export default function OrganicPathPage() {
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    city_village: '',
    crop_name: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // ✅ FIXED SUBMIT LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setIsLoading(true)

    const payload = {
      state: formData.state.trim(),
      district: formData.district.trim(),
      city_village: formData.city_village.trim(),
      crop_name: formData.crop_name.trim(),
    }

    try {
      const res = await fetch('/api/organic_path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      let data

      // ✅ SAFE JSON PARSE (fixes "<!DOCTYPE" error)
      try {
        data = await res.json()
      } catch {
        throw new Error('Server returned invalid response (not JSON)')
      }

      console.log('[Frontend] API response:', data)

      if (!res.ok) {
        throw new Error(
          data?.error ||
          data?.detail ||
          'Request failed'
        )
      }

      setResult(data)

    } catch (err) {
      console.error('[Frontend Error]:', err)
      setError(err?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const outputText = String(
    result?.output ||
    result?.result ||
    result?.data?.result ||
    ''
  ).trim()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Organic Farming Path
            </h1>
            <p className="text-lg text-gray-600">
              Enter your farm location and crop details to generate a backend-powered organic farming path.
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sprout className="h-5 w-5 mr-2 text-green-600" />
                Input Details
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Enter state"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    placeholder="Enter district"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city_village">City / Village</Label>
                  <Input
                    id="city_village"
                    value={formData.city_village}
                    onChange={(e) => handleChange('city_village', e.target.value)}
                    placeholder="Enter city or village"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crop_name">Crop Name</Label>
                  <Input
                    id="crop_name"
                    value={formData.crop_name}
                    onChange={(e) => handleChange('crop_name', e.target.value)}
                    placeholder="Enter crop name"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Organic Farming'
                  )}
                </Button>

              </form>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <Card className="mt-6 overflow-hidden border-green-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-800">
                    Your Organic Farming Path
                  </CardTitle>
                </div>
                <p className="text-sm text-gray-600">
                  Detailed recommendation generated by your ML model.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-green-50/40 p-3 text-xs text-green-800">
                  Output from ML model
                </div>
                <div className="rounded-lg border bg-white p-5">
                  <p className="text-gray-900 text-[15px] leading-7 whitespace-pre-wrap min-h-[160px]">
                    {outputText || 'No response received from model'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </ProtectedRoute>
  )
}