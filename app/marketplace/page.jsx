'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Phone, Mail, MapPin, Leaf, Plus } from 'lucide-react';

// Sample Products Data
const sampleProducts = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    description: 'Freshly grown organic tomatoes from local farms.',
    price: 50,
    unit: 'kg',
    quantity_available: 100,
    image_url: 'https://www.richardjacksonsgarden.co.uk/wp-content/uploads/2021/04/AdobeStock_554658202_1200px.jpg.webp',
    category: 'vegetables',
    is_organic: true,
    created_at: '2025-01-01',
    farmer: {
      name: 'Rahul Kumar',
      phone: '+919876543210',
      email: 'rahul@example.com',
      address: 'Village A, District X, State Y',
      profile_picture_url: null,
    },
  },
  {
    id: '2',
    name: 'Fresh Mangoes',
    description: 'Sweet and juicy organic mangoes.',
    price: 120,
    unit: 'kg',
    quantity_available: 50,
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHEnqmHwmb3jH5KBntBrMjSocfHUiu3zJKGQ&s',
    category: 'fruits',
    is_organic: false,
    created_at: '2025-01-02',
    farmer: {
      name: 'Sunita Sharma',
      phone: '+919812345678',
      email: 'sunita@example.com',
      address: 'Village B, District Y, State Z',
      profile_picture_url: null,
    },
  },
  // Add more sample products as needed
];

export default function MarketplacePage() {
  const [products, setProducts] = useState(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [organicOnly, setOrganicOnly] = useState(false);

  const categories = [
    'all',
    'vegetables',
    'fruits',
    'grains',
    'pulses',
    'spices',
    'herbs',
    'dairy',
    'others',
  ];

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (organicOnly) {
      filtered = filtered.filter(product => product.is_organic);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, organicOnly]);

  const handleContactFarmer = (farmer) => {
    alert(`Contact ${farmer.name} at ${farmer.phone} or ${farmer.email}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Organic Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover fresh, organic products directly from verified farmers.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={organicOnly ? "default" : "outline"}
              onClick={() => setOrganicOnly(!organicOnly)}
              className="flex items-center space-x-2"
            >
              <Leaf className="h-4 w-4" />
              <span>Organic Only</span>
            </Button>
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {filteredProducts.length} products found
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.is_organic && (
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      <Leaf className="h-3 w-3 mr-1" />
                      Organic
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">₹{product.price}</div>
                      <div className="text-sm text-gray-500">per {product.unit}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit">{product.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    Available: {product.quantity_available} {product.unit}
                  </div>

                  {/* Farmer Info */}
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={product.farmer.profile_picture_url || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg'}
                        alt={product.farmer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.farmer.name}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {product.farmer.address.split(',')[0]}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleContactFarmer(product.farmer)}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`mailto:${product.farmer.email}`, '_blank')}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Want to List Your Products?</h2>
          <p className="text-xl mb-6">Join our marketplace and connect directly with buyers</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/become-seller" className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Become a Seller
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
