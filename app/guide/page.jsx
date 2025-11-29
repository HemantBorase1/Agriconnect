'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  MapPin, 
  Mail, 
  Award, 
  MessageCircle,
  DollarSign,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Memoized phone formatter to avoid recreating on every render
const formatPhoneForWhatsApp = (raw) => {
  if (!raw) return '';
  return String(raw).replace(/\D/g, '');
};

const page = () => {
  const [experiencedFarmers, setExperiencedFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGuides = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Add cache control and abort signal for cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      // Add timestamp to ensure fresh data
      const resp = await fetch(`/api/guides?t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-store', // Always fetch fresh data from server
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error('Failed to fetch guides');
      }
      const data = await resp.json();
      setExperiencedFarmers(data.guides || []);
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      console.error('Error fetching guides:', e);
      setError(e.message || 'Failed to load guides');
      setExperiencedFarmers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Expert <span className="text-green-600">Agricultural Guides</span>
              </h1>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchGuides}
                disabled={isLoading}
                className="shrink-0"
                title="Refresh guides"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with experienced farmers and agricultural experts. Get personalized 
              guidance and mentorship to improve your farming practices and grow your business.
            </p>
          </div>
        </div>
      </section>

      {/* Farmers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 mx-auto text-green-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading guides...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <Award className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading guides</h3>
              <p className="text-gray-600">{error}</p>
              <Button onClick={fetchGuides} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : experiencedFarmers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Award className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No guides available</h3>
              <p className="text-gray-600">There are currently no experienced guides available. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {experiencedFarmers.map((farmer) => {
                const whatsappPhone = formatPhoneForWhatsApp(farmer.phone);
                const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hello ' + farmer.name + ', I would like to get guidance.')}`;
                const initials = farmer.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                
                return (
              <Card key={farmer.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20 border-4 border-green-100">
                        <AvatarImage src={farmer.photo || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg'} alt={farmer.name} loading="lazy" />
                        <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-1">
                          {farmer.name}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          <Award className="h-3 w-3 mr-1" />
                          {farmer.experience}
                        </Badge>
                      </div>
                    </div>
                    
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{farmer.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{farmer.address}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-green-100 text-green-700 text-[10px] font-semibold">Ph</span>
                      <span className="text-sm">{farmer.phone}</span>
                    </div>
                  </div>


                  {/* Specialties */}
                  <div className="pt-2">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {farmer.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Guidance Fees */}
                  <div className="pt-2 pb-4">
                    <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Guidance Fees:</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {farmer.guidanceFees}
                      </span>
                    </div>
                  </div>


                  {/* Contact Action */}
                  <div className="pt-4">
                    <Button asChild variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${farmer.name}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Learn from the Best?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Connect with experienced farmers and agricultural experts to take your farming 
            practices to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
              Become a Guide
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-green-600"
            >
              Browse All Guides
            </Button>
          </div>
        </div>
      </section>
      </div>
    </ProtectedRoute>
  );
};

export default page;
