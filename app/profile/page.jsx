'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CheckCircle2, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, Edit, Trash2, Leaf, MapPin, DollarSign, Calendar, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    profile_picture_url: '',
    role: 'farmer',
    address: '',
  })

  const [editData, setEditData] = useState({
    name: '',
    address: '',
    experience_years: 0,
    specialties: '',
    guidance_fees: ''
  })

  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(user.profile_picture_url || '')

  // Mock products data - replace with real API calls later
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Fresh Organic Tomatoes',
      description: 'Freshly harvested organic tomatoes from our farm',
      price: 45,
      unit: 'kg',
      quantity_available: 50,
      category: 'vegetables',
      location: 'Pune, Maharashtra',
      is_organic: true,
      image_url: '',
      created_at: '2024-01-15',
    },
    {
      id: 2,
      name: 'Premium Basmati Rice',
      description: 'High quality basmati rice, perfect for daily cooking',
      price: 120,
      unit: 'kg',
      quantity_available: 25,
      category: 'grains',
      location: 'Pune, Maharashtra',
      is_organic: false,
      image_url: '',
      created_at: '2024-01-10',
    },
  ])

  const [showFarmerPopup, setShowFarmerPopup] = useState(false)
  const [isEditingRole, setIsEditingRole] = useState(false)

  // Product edit dialog state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productEdit, setProductEdit] = useState({
    name: '',
    description: '',
    price: 0,
    unit: '',
    quantity_available: 0,
    category: '',
    location: '',
    is_organic: false,
    image_url: '',
  })
  const [productImagePreview, setProductImagePreview] = useState('')
  const categories = ['vegetables','fruits','grains','pulses','spices','herbs','dairy','others']
  const units = ['kg','gram','liter','piece','dozen','quintal','ton']

  const router = useRouter()
  const [showSaved, setShowSaved] = useState(false)

  const onSaveProfile = async () => {
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      if (!token) {
        router.push('/auth/signin')
        return
      }

      const resp = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editData.name,
          address: editData.address,
          profile_picture_url: imagePreview || null,
          experience_years: editData.experience_years,
          specialties: editData.specialties,
          guidance_fees: editData.guidance_fees,
        })
      })

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to update profile')
      }

    setUser((prev) => ({ 
      ...prev, 
      name: editData.name, 
      address: editData.address,
      profile_picture_url: imagePreview || prev.profile_picture_url,
    }))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update profile')
    }
  }

  const onLogout = () => {
    // TODO: clear auth state/session
    router.push('/auth/signin')
  }

  const onDeleteAccount = () => {
    // TODO: call delete API and clear auth state
    router.push('/auth/signin')
  }

  const onAddProducts = () => {
    setShowFarmerPopup(false)
    router.push('/become-seller')
  }

  const onDeleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId))
  }

  const onEditProduct = (productId) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    setEditingProductId(productId)
    setProductEdit({
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      quantity_available: product.quantity_available,
      category: product.category,
      location: product.location,
      is_organic: product.is_organic,
      image_url: product.image_url,
    })
    setProductImagePreview(product.image_url || '')
    setIsProductDialogOpen(true)
  }

  const onSaveProduct = () => {
    if (editingProductId == null) return
    setProducts(prev => prev.map(p => p.id === editingProductId ? {
      ...p,
      ...productEdit,
      image_url: productImagePreview,
    } : p))
    setIsProductDialogOpen(false)
    setEditingProductId(null)
  }

  const onChangeProfileImage = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target?.result || '')
      reader.readAsDataURL(file)
    }
  }

  const onChangeProductImage = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setProductImagePreview(ev.target?.result || '')
      reader.readAsDataURL(file)
    }
  }

  const roleLabel = user.role === 'farmer' ? 'Farmer' : 'Vendor'
  const isGuide = user.role === 'farmer' && Number(editData.experience_years) >= 7

  useEffect(() => {
    async function loadProfile() {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      if (!token) {
        router.push('/auth/signin')
        return
      }
      const resp = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!resp.ok) {
        return
      }
      const data = await resp.json()
      const u = data.user
      const p = data.profile
      setUser({
        name: p?.name || '',
        email: u?.email || '',
        profile_picture_url: p?.profile_picture_url || '',
        role: u?.role || 'farmer',
        address: p?.address || '',
      })
      setEditData({
        name: p?.name || '',
        address: p?.address || '',
        experience_years: p?.experience_years || 0,
        specialties: Array.isArray(p?.specialties) ? p.specialties.join(', ') : (p?.specialties || ''),
        guidance_fees: p?.guidance_fees ?? '',
      })
      setImagePreview(p?.profile_picture_url || '')
    }
    loadProfile()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profile_picture_url} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-2xl font-semibold text-gray-900">{user.name}</p>
                  <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                    {roleLabel}
                  </Badge>
                </div>
                <p className="text-gray-600 text-lg">{user.email}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="photo" className="flex items-center">Profile Photo</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={imagePreview} alt={editData.name} />
                          <AvatarFallback>{editData.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <input id="photo" type="file" accept="image/*" className="hidden" onChange={onChangeProfileImage} />
                          <Button type="button" variant="outline" onClick={() => document.getElementById('photo')?.click()} className="flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="px-3 py-2 border rounded-md bg-gray-50 text-gray-700 capitalize">{roleLabel}</div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={editData.address}
                        onChange={(e) => setEditData((d) => ({ ...d, address: e.target.value }))}
                        placeholder="Your address"
                      />
                    </div>

                    {user.role === 'farmer' && (
                      <>
                        <div className="space-y-2">
                          <Label>Years of Farming Experience</Label>
                          <div className="px-3 py-2 border rounded-md bg-gray-50 text-gray-700">{editData.experience_years}</div>
                        </div>

                        {isGuide && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="specialties">Specialties</Label>
                              <Input
                                id="specialties"
                                placeholder="e.g. Organic Farming, Soil Management"
                                value={editData.specialties}
                                onChange={(e) => setEditData((d) => ({ ...d, specialties: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="guidance_fees">Guidance Fees (₹)</Label>
                              <Input
                                id="guidance_fees"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editData.guidance_fees}
                                onChange={(e) => setEditData((d) => ({ ...d, guidance_fees: e.target.value }))}
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <div className="pt-2">
                      <Button className="w-full" onClick={async () => { await onSaveProfile(); setShowSaved(true); setTimeout(() => setShowSaved(false), 2500) }}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full" size="lg" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Section for Farmers */}
        {user.role === 'farmer' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-2xl font-bold text-gray-900">My Products</CardTitle>
                </div>
                <Button onClick={() => router.push('/become-seller')} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first product to the marketplace</p>
                  <Button onClick={() => router.push('/become-seller')} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
                          {product.is_organic && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Leaf className="w-3 h-3 mr-1" />
                              Organic
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ₹{product.price} per {product.unit}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Package className="w-4 h-4 mr-1" />
                            {product.quantity_available} {product.unit} available
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            {product.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            Added {new Date(product.created_at).toISOString().slice(0,10)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => onEditProduct(product.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => onDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Farmer Role Selection Popup */}
        <Dialog open={showFarmerPopup} onOpenChange={setShowFarmerPopup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Welcome to AgriConnect as a Farmer!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Great! You've selected the Farmer role. Would you like to add your organic products to our marketplace?
              </p>
              <p className="text-sm text-gray-500">
                This will help you reach more buyers and grow your farming business.
              </p>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFarmerPopup(false)}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button 
                  onClick={onAddProducts}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Products
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Edit Product Dialog */}
               {/* Edit Product Dialog */}
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Product Image */}
              <div className="space-y-2">
                <Label className="flex items-center">Product Image</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    {productImagePreview ? (
                      <img
                        src={productImagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      id="product-photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onChangeProductImage}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('product-photo')?.click()}
                      className="flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pname">Product Name</Label>
                  <Input
                    id="pname"
                    value={productEdit.name}
                    onChange={(e) => setProductEdit((d) => ({ ...d, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcategory">Category</Label>
                  <Select
                    value={productEdit.category}
                    onValueChange={(v) => setProductEdit((d) => ({ ...d, category: v }))}
                  >
                    <SelectTrigger id="pcategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdesc">Description</Label>
                <Input
                  id="pdesc"
                  value={productEdit.description}
                  onChange={(e) => setProductEdit((d) => ({ ...d, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pprice">Price (₹)</Label>
                  <Input
                    id="pprice"
                    type="number"
                    value={productEdit.price}
                    onChange={(e) => setProductEdit((d) => ({ ...d, price: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="punit">Unit</Label>
                  <Select
                    value={productEdit.unit}
                    onValueChange={(v) => setProductEdit((d) => ({ ...d, unit: v }))}
                  >
                    <SelectTrigger id="punit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pqty">Available Quantity</Label>
                  <Input
                    id="pqty"
                    type="number"
                    value={productEdit.quantity_available}
                    onChange={(e) =>
                      setProductEdit((d) => ({ ...d, quantity_available: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plocation">Location</Label>
                  <Input
                    id="plocation"
                    value={productEdit.location}
                    onChange={(e) => setProductEdit((d) => ({ ...d, location: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porganic">Organic</Label>
                  <Select
                    value={productEdit.is_organic ? 'yes' : 'no'}
                    onValueChange={(v) => setProductEdit((d) => ({ ...d, is_organic: v === 'yes' }))}
                  >
                    <SelectTrigger id="porganic">
                      <SelectValue placeholder="Is organic?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full" onClick={onSaveProduct}>
                  Save Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Saved Toast at bottom */}
      <SavedToast open={showSaved} onClose={() => setShowSaved(false)} />
    </div>
  )
}


function SavedToast({ open, onClose }) {
  if (!open) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-lg border rounded-lg p-4 flex items-center gap-3">
      <CheckCircle2 className="text-green-600 w-6 h-6" />
      <div>
        <p className="font-medium text-gray-900">Changes saved</p>
        <p className="text-sm text-gray-600">Your profile has been updated.</p>
      </div>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700">
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
