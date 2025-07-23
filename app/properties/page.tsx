'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyFilters from '@/components/properties/PropertyFilters';
import { Button } from '@/components/ui/button';
import { MapPin, Grid, List, Loader2 } from 'lucide-react';

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

export default function PropertiesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProperties();
    if (session) {
      fetchBookmarksStatus();
    }
  }, [session]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();
      
      if (response.ok) {
        setProperties(data);
        setFilteredProperties(data);
      } else {
        setError(data.error || 'Failed to fetch properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarksStatus = async () => {
    try {
      const response = await fetch('/api/bookmarks/user');
      const data = await response.json();
      if (response.ok) {
        setBookmarkedProperties(new Set(data));
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleFilterChange = (filters: any) => {
    let filtered = properties;

    if (filters.location) {
      filtered = filtered.filter(p => 
        p.location.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.location.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minRent) {
      filtered = filtered.filter(p => p.rent >= parseInt(filters.minRent));
    }

    if (filters.maxRent) {
      filtered = filtered.filter(p => p.rent <= parseInt(filters.maxRent));
    }

    if (filters.bhk) {
      filtered = filtered.filter(p => p.bhk === parseInt(filters.bhk));
    }

    if (filters.furnishing) {
      filtered = filtered.filter(p => p.furnishing === filters.furnishing);
    }

    if (filters.propertyType) {
      filtered = filtered.filter(p => p.propertyType === filters.propertyType);
    }

    setFilteredProperties(filtered);
  };

  const handleBookmark = async (propertyId: string) => {
    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/signin?callbackUrl=/properties';
      return;
    }

    try {
      const isBookmarked = bookmarkedProperties.has(propertyId);
      const method = isBookmarked ? 'DELETE' : 'POST';
      
      const response = await fetch('/api/bookmarks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      if (response.ok) {
        const newBookmarksSet = new Set(bookmarkedProperties);
        if (isBookmarked) {
          newBookmarksSet.delete(propertyId);
        } else {
          newBookmarksSet.add(propertyId);
        }
        setBookmarkedProperties(newBookmarksSet);
      } else {
        const data = await response.json();
        console.error('Bookmark error:', data.error);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Properties
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties for Rent</h1>
            <p className="text-gray-600 mt-2">
              {filteredProperties.length} properties found
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <PropertyFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    onBookmark={handleBookmark}
                    isBookmarked={bookmarkedProperties.has(property._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
