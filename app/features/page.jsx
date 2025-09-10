import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Droplets, Sun, Bug, Scaling as Seedling, Recycle, Heart, TreePine, Zap } from 'lucide-react'

export default function FeaturesPage() {
  const organicConcepts = [
    {
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      title: "Organic Fertilizers",
      description: "Learn about natural fertilizers like compost, manure, and bio-fertilizers that enhance soil health without harmful chemicals."
    },
    {
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      title: "Water Conservation",
      description: "Discover efficient irrigation techniques, rainwater harvesting, and drought-resistant farming practices."
    },
    {
      icon: <Sun className="w-8 h-8 text-yellow-600" />,
      title: "Solar-Powered Farming",
      description: "Explore sustainable energy solutions for irrigation, lighting, and equipment using solar technology."
    },
    {
      icon: <Bug className="w-8 h-8 text-red-600" />,
      title: "Natural Pest Control",
      description: "Implement biological pest control methods using beneficial insects, companion planting, and organic pesticides."
    },
    {
      icon: <Seedling className="w-8 h-8 text-green-500" />,
      title: "Crop Rotation",
      description: "Understand the importance of rotating crops to maintain soil fertility and prevent disease buildup."
    },
    {
      icon: <Recycle className="w-8 h-8 text-purple-600" />,
      title: "Waste Management",
      description: "Learn composting techniques and agricultural waste recycling to create sustainable farming systems."
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      title: "Soil Health",
      description: "Maintain soil biodiversity through organic matter, cover crops, and minimal tillage practices."
    },
    {
      icon: <TreePine className="w-8 h-8 text-green-700" />,
      title: "Agroforestry",
      description: "Integrate trees and shrubs into agricultural systems for improved ecosystem services and biodiversity."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Precision Agriculture",
      description: "Use technology and data analytics to optimize farming practices and increase efficiency."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Organic Farming Concepts
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore sustainable agricultural practices that protect the environment, 
            improve soil health, and produce healthy food for future generations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {organicConcepts.map((concept, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">{concept.icon}</div>
                  <CardTitle className="text-lg">{concept.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{concept.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <section className="mt-20 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Benefits of Organic Farming
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Environmental Benefits</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Reduces chemical pollution in soil and water</li>
                <li>• Preserves biodiversity and ecosystem balance</li>
                <li>• Improves soil structure and fertility</li>
                <li>• Reduces greenhouse gas emissions</li>
                <li>• Conserves water resources</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Economic Benefits</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Premium prices for organic products</li>
                <li>• Reduced input costs over time</li>
                <li>• Access to niche markets</li>
                <li>• Government subsidies and certifications</li>
                <li>• Long-term sustainability</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Organic Journey?
          </h2>
          <p className="text-xl mb-6">
            Join our community of farmers committed to sustainable agriculture
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Expert Guidance
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Explore Marketplace
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
