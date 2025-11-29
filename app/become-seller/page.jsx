'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Upload, Loader2, Package, Camera, Leaf, ArrowLeft, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import { checkAuth } from '@/lib/auth-utils'

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  quantity_available: z.number().min(1, 'Quantity must be at least 1'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  is_organic: z.boolean(),
})

export default function BecomeSellerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [productImage, setProductImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_organic: false,
    },
  })

  const categories = ['vegetables','fruits','grains','pulses','spices','herbs','dairy','others']
  const units = ['kg','gram','liter','piece','dozen','quintal','ton']
  const isOrganic = watch('is_organic')

  // Check if user is vendor and redirect
  useEffect(() => {
    async function checkUserRole() {
      try {
        const { isAuthenticated } = await checkAuth()
        if (!isAuthenticated) {
          router.push('/auth/signin')
          return
        }
        
        const session = await supabase.auth.getSession()
        const token = session?.data?.session?.access_token
        if (!token) {
          router.push('/auth/signin')
          return
        }

        const resp = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (!resp.ok) {
          router.push('/marketplace')
          return
        }

        const data = await resp.json()
        const userRole = data.user?.role

        // If user is vendor, redirect to marketplace
        if (userRole === 'vendor') {
          router.push('/marketplace')
          return
        }

        setCheckingRole(false)
      } catch (e) {
        console.error('Error checking user role:', e)
        router.push('/marketplace')
      }
    }
    checkUserRole()
  }, [router])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError(null)
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      if (!token) {
        throw new Error('Please sign in to list a product')
      }

      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        unit: data.unit,
        quantity_available: data.quantity_available,
        category: data.category,
        location: data.location,
        is_organic: data.is_organic === true,
        image_base64: imagePreview || null,
      }

      const resp = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const json = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        throw new Error(json.error || 'Failed to create product')
      }

      setSuccess(true)
      setTimeout(() => router.push('/profile'), 1200)
    } catch (e) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingRole) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (success) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Product Listed Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Your product has been added to the marketplace and is now visible in your profile. Redirecting...
              </p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/profile" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">List Your Product</h1>
          <p className="text-xl text-gray-600">Share your produce with buyers across the platform</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <Package className="h-6 w-6 mr-2 text-green-600" />
              Product Details
            </CardTitle>
            <p className="text-gray-600">Fill in the details about your product to attract potential buyers</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Product Image */}
              <div className="space-y-4">
                <Label htmlFor="product-image" className="text-lg font-semibold flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Product Image
                </Label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('product-image')?.click()}
                      className="flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="Product preview" className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300" />
                      <Badge className="absolute -top-2 -right-2 bg-green-600">Preview</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <Package className="h-4 w-4 mr-2" /> Product Name
                  </Label>
                  <Input id="name" {...register('name')} placeholder="e.g., Fresh Tomatoes" />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} placeholder="Describe your product" rows={4} />
                {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
              </div>

              {/* Price, Unit, Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" /> Price (₹)
                  </Label>
                  <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="0.00" />
                  {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select onValueChange={(value) => setValue('unit', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (<SelectItem key={unit} value={unit}>{unit}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {errors.unit && <p className="text-sm text-red-600">{errors.unit.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Available Quantity</Label>
                  <Input id="quantity" type="number" {...register('quantity_available', { valueAsNumber: true })} placeholder="0" />
                  {errors.quantity_available && <p className="text-sm text-red-600">{errors.quantity_available.message}</p>}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Location</Label>
                <Input id="location" {...register('location')} placeholder="Village, District, State" />
                {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
              </div>

              {/* Organic */}
              <div className="flex items-center space-x-3">
                <Checkbox id="organic" checked={isOrganic} onCheckedChange={(checked) => setValue('is_organic', checked)} />
                <Label htmlFor="organic" className="flex items-center cursor-pointer">
                  <Leaf className="h-4 w-4 mr-2 text-green-600" /> Organic Product
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Package className="w-4 h-4 mr-2" /> List Product</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
