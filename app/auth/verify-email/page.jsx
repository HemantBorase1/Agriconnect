'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function getStoredEmail() {
  try {
    return localStorage.getItem('pendingEmail') || ''
  } catch {
    return ''
  }
}

export default function VerifyEmailPage() {
  const [resending, setResending] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [error, setError] = React.useState('')

  const handleResend = async () => {
    setResending(true)
    setMessage('')
    setError('')
    const email = getStoredEmail()
    if (!email) {
      setError('No email found to resend. Please sign up again.')
      setResending(false)
      return
    }
    try {
      const emailRedirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/signin` : undefined
      const resp = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo: emailRedirectTo }),
      })
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to resend')
      }
      setMessage('Verification email sent. Please check your inbox.')
    } catch (e) {
      setError(e?.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Check Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <Button className="w-full" variant="outline" onClick={handleResend} disabled={resending}>
            {resending ? 'Resending...' : 'Resend verification email'}
          </Button>
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              Back to Sign In
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
