'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PropertyCard from '@/components/properties/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Property {
  _id: string;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  bhk: number;
  furnishing: string;
  propertyType: string;
  area: number;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  amenities: string[];
  images: string[];
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  isVerified: boolean;
  availableFrom: string;
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/bookmarks');
      return;
    }

    fetchBookmarkedProperties();
  }, [session, status, router]);

  const fetchBookmarkedProperties = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      const data = await response.json();

      if (response.ok) {
        setBookmarkedProperties(data);
      } else {
        setError(data.error || 'Failed to fetch bookmarked properties');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (propertyId: string) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      if (response.ok) {
        // Remove from local state
        setBookmarkedProperties(prev => 
          prev.filter(property => property._id !== propertyId)
        );
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove bookmark');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2 text-red-700">
              <span className="text-sm">{error}</span>
            </div>
            <div className="mt-4 text-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              My Bookmarks
            </h1>
            <p className="text-gray-600 mt-2">
              {bookmarkedProperties.length} bookmarked properties
            </p>
          </div>
          
          <Link href="/properties">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
          </Link>
        </div>

        {bookmarkedProperties.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookmarked properties yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start browsing properties and bookmark your favorites to see them here.
            </p>
            <Link href="/properties">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {bookmarkedProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onBookmark={handleRemoveBookmark}
                isBookmarked={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
