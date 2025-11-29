'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import WeatherWidget from '@/components/WeatherWidget'
import { checkAuth } from '@/lib/auth-utils'
import {
  Users,
  ShoppingCart,
  MessageCircle,
  TrendingUp,
  Shield,
  Smartphone,
  ArrowRight,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAuthStatus() {
      const { isAuthenticated: auth } = await checkAuth()
      setIsAuthenticated(auth)
      setIsChecking(false)
    }
    checkAuthStatus()
  }, [])

  const handleGetStarted = (e) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push('/profile')
    } else {
      router.push('/auth/signin')
    }
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-green-600">AgriConnect</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The comprehensive platform connecting farmers, vendors, and
              agricultural experts. Grow your farming business with AI-powered
              insights, direct marketplace access, and expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleGetStarted}
                disabled={isChecking}
              >
                {isChecking ? 'Loading...' : 'Get Started'}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Agriculture
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive tools and services designed for today&apos;s agricultural professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Expert Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with experienced farmers and agricultural experts. Get personalized
                  guidance and mentorship to improve your farming practices.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Direct access to buyers and sellers. List your organic products or find
                  quality agricultural products from verified farmers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get instant answers to your agricultural questions with our AI-powered
                  assistant. Make informed decisions based on expert knowledge.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Weather Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Real-time weather data and forecasts to help you plan your farming
                  activities and protect your crops.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your data is protected with enterprise-grade security. All transactions
                  and communications are encrypted and secure.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Mobile Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access all features on any device. Our responsive design ensures you
                  can manage your agricultural business from anywhere.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
              <div className="text-gray-600">Active Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Expert Guides</div>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Widget Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated with Weather
            </h2>
            <p className="text-lg text-gray-600">
              Get real-time weather information for your location
            </p>
          </div>
          <div className="flex justify-center">
            <WeatherWidget />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Agricultural Business?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and vendors who are already using AgriConnect
            to grow their business and improve their farming practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              disabled={isChecking}
            >
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-green-600"
              asChild
            >
              <Link href="/marketplace">Explore Marketplace</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
