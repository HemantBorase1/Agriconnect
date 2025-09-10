'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, User, ExternalLink, Newspaper, TrendingUp } from 'lucide-react';

const mockArticles = [
  {
    id: '1',
    title: 'New Organic Farming Subsidies Announced by Government',
    content: 'The government has announced new subsidies for organic farming practices to encourage sustainable agriculture. Farmers can now receive up to 50% subsidy on organic fertilizers and certification costs.',
    image_url: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg',
    category: 'government_scheme',
    created_at: new Date().toISOString(),
    author: { name: 'AgriConnect Admin' },
  },
  {
    id: '2',
    title: 'Best Practices for Monsoon Crop Protection',
    content: 'Learn essential techniques to protect your crops during the monsoon season. From proper drainage to disease prevention, here are expert tips for successful farming.',
    image_url: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg',
    category: 'agriculture',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author: { name: 'Dr. Agricultural Expert' },
  },
  {
    id: '3',
    title: 'Digital Agriculture: Technology Transforming Farming',
    content: 'Explore how digital tools and AI are revolutionizing modern agriculture. From precision farming to crop monitoring, technology is helping farmers increase productivity.',
    image_url: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg',
    category: 'general',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    author: { name: 'Tech Agriculture Team' },
  },
];

export default function NewsPage() {
  const [articles, setArticles] = useState(mockArticles);
  const [filteredArticles, setFilteredArticles] = useState(mockArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'government_scheme', label: 'Government Schemes' },
    { value: 'general', label: 'General' },
  ];

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory]);

  const filterArticles = () => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'agriculture':
        return 'bg-green-100 text-green-800';
      case 'government_scheme':
        return 'bg-blue-100 text-blue-800';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'agriculture':
        return <TrendingUp className="h-4 w-4" />;
      case 'government_scheme':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <Newspaper className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Agricultural News & Updates</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest news in agriculture, government schemes, and farming innovations to help grow your agricultural business.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Newspaper className="h-4 w-4 mr-2" />
              {filteredArticles.length} articles found
            </div>
          </div>
        </div>

        {/* News Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Newspaper className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${getCategoryColor(article.category)}`}>
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(article.category)}
                      <span className="capitalize">{article.category.replace('_', ' ')}</span>
                    </div>
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{article.author?.name || 'Admin'}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.content}</p>
                  <Button variant="outline" className="w-full">
                    Read More
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with Agricultural News</h2>
          <p className="text-xl mb-6">
            Get the latest updates on farming techniques, government schemes, and agricultural innovations
          </p>
          <Button size="lg" variant="secondary">
            Subscribe to Newsletter
          </Button>
        </div>
      </div>
    </div>
  );
}
