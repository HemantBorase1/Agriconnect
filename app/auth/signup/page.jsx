'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { checkAuth } from '@/lib/auth-utils'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [role, setRole] = useState('')
  const [error, setError] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    async function checkIfLoggedIn() {
      const { isAuthenticated } = await checkAuth()
      if (isAuthenticated) {
        router.push('/profile')
      } else {
        setCheckingAuth(false)
      }
    }
    checkIfLoggedIn()
  }, [router])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = e.currentTarget
    const name = form.querySelector('#name')?.value?.trim()
    const email = form.querySelector('#email')?.value?.trim()
    const password = form.querySelector('#password')?.value
    const phone = form.querySelector('#phone')?.value?.trim()
    const aadhaar = form.querySelector('#aadhaar')?.value?.trim()
    const address = form.querySelector('#address')?.value?.trim()
    const experience_years = form.querySelector('#experience')?.value?.trim()

    try {
      const emailRedirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/signin` : undefined

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      })
      if (signUpError) throw signUpError

      const userId = signUpData.user?.id
      if (!userId) {
        throw new Error('Failed to create account')
      }

      try {
        localStorage.setItem('pendingEmail', email)
      } catch {}

      // Bootstrap application-specific tables via API (server will handle image upload)
      const resp = await fetch('/api/authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          role,
          name,
          phone,
          aadhaar_number: aadhaar,
          address,
          profile_picture_url: imagePreview || null,
          experience_years,
          // never send plain password to your DB; server treats this as optional
          password,
        }),
      })
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}))
        console.warn('Bootstrap failed', payload)
        // surface a gentle warning but still allow email verification step
        setError(payload?.error || 'Account created, but failed to save profile. You can try again after verifying email.')
      }

      router.push('/auth/verify-email')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Your Account
          </CardTitle>
          <p className="text-center text-gray-600">
            Join AgriConnect and start your agricultural journey
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {/* Profile Picture */}
            <div className="space-y-2">
              <Label htmlFor="profile-picture">Profile Picture</Label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('profile-picture')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a strong password" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter your phone number" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input id="aadhaar" placeholder="Enter your Aadhaar number" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter your complete address" rows={3} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="vendor">Vendor/Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'farmer' && (
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Farming Experience</Label>
                  <Input id="experience" type="number" placeholder="0" min="0" />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-green-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
