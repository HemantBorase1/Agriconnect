'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Mock banners (replace with API later if needed)
    const mockBanners = [
      {
        id: '1',
        title: 'Welcome to Our Platform 🚀',
        image_url: '/images/banner1.jpg',
        link_url: 'https://example.com',
      },
      {
        id: '2',
        title: 'Get 50% Off on Premium 🎉',
        image_url: '/images/banner2.jpg',
        link_url: 'https://example.com/offer',
      },
    ];
    setBanners(mockBanners);
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (!isVisible || banners.length === 0) return null;

  const banner = banners[currentBanner];

  return (
    <div className="relative bg-gradient-to-r from-green-500 to-blue-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="h-12 w-12 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{banner.title}</p>
              {banner.link_url && (
                <a
                  href={banner.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-100 hover:text-white underline"
                >
                  Learn More
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
