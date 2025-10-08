'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = e.currentTarget
    const email = form.querySelector('#email')?.value?.trim()
    const password = form.querySelector('#password')?.value

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const user = data.user
      if (!user?.email_confirmed_at) {
        await supabase.auth.signOut()
        throw new Error('Please verify your email before signing in.')
      }

      router.push('/')
    } catch (err) {
      console.error(err)
      const msg = err?.message || ''
      if (/Invalid login credentials/i.test(msg)) {
        setError('Invalid email or password')
      } else if (/Email not confirmed/i.test(msg)) {
        setError('Please verify your email before signing in.')
      } else {
        setError(msg || 'Failed to sign in')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign In to AgriConnect
          </CardTitle>
          <p className="text-center text-gray-600">
            Welcome back! Please sign in to your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" required />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-green-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
