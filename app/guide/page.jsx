'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Mail, 
  Award, 
  MessageCircle,
  DollarSign
} from 'lucide-react';

const page = () => {
  const formatPhoneForWhatsApp = (raw) => {
    // wa.me expects only digits with country code (no +)
    const digitsOnly = String(raw).replace(/\D/g, '');
    return digitsOnly;
  };

  // Mock data for experienced farmers
  const experiencedFarmers = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      address: "123 Farm Road, Green Valley, CA 90210",
      phone: "+1 (555) 123-4567",
      photo: "/api/placeholder/200/200",
      experience: "15+ years",
      guidanceFees: "$50/hour",
      specialties: ["Organic Farming", "Crop Rotation", "Soil Management"]
    },
    {
      id: 2,
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      address: "456 Harvest Lane, Farmington, TX 75001",
      phone: "+1 (555) 987-6543",
      photo: "/api/placeholder/200/200",
      experience: "12+ years",
      guidanceFees: "$45/hour",
      specialties: ["Livestock Management", "Pasture Rotation", "Animal Health"]
    },
    {
      id: 3,
      name: "David Chen",
      email: "david.chen@example.com",
      address: "789 Agriculture Blvd, Cornfield, IA 50001",
      phone: "+1 (555) 456-7890",
      photo: "/api/placeholder/200/200",
      experience: "20+ years",
      guidanceFees: "$60/hour",
      specialties: ["Precision Agriculture", "Technology Integration", "Data Analysis"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Expert <span className="text-green-600">Agricultural Guides</span>
            </h1>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {experiencedFarmers.map((farmer) => (
              <Card key={farmer.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20 border-4 border-green-100">
                        <AvatarImage src={farmer.photo} alt={farmer.name} />
                        <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
                          {farmer.name.split(' ').map(n => n[0]).join('')}
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
                        href={`https://wa.me/${formatPhoneForWhatsApp(farmer.phone)}?text=${encodeURIComponent('Hello ' + farmer.name + ', I would like to get guidance.')}`}
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
            ))}
          </div>
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
  );
};

export default page;
