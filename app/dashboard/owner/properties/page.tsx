'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Building2, Eye, Edit, Trash2, Plus, MapPin, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

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
  isVerified: boolean;
  isActive: boolean;
  availableFrom: string;
  createdAt: string;
}

export default function MyPropertiesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/dashboard/owner/properties');
      return;
    }
    fetchMyProperties();
  }, [session, router]);

  const fetchMyProperties = async () => {
    try {
      const response = await fetch('/api/properties/my-properties');
      const data = await response.json();

      if (response.ok) {
        setProperties(data);
      } else {
        setError(data.error || 'Failed to fetch properties');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProperties(properties.filter(p => p._id !== propertyId));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete property');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const togglePropertyStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setProperties(properties.map(p => 
          p._id === propertyId ? { ...p, isActive: !currentStatus } : p
        ));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update property');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600 mt-2">
              Manage your {properties.length} listed properties
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/properties/new">
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </Button>
            </Link>
            <Link href="/dashboard/owner">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No properties listed yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first property to attract tenants.
            </p>
            <Link href="/properties/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {properties.map((property) => (
              <Card key={property._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Property Image */}
                    <div className="lg:w-1/4">
                      <div className="relative h-48 lg:h-32 rounded-lg overflow-hidden">
                        <Image
                          src={property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="lg:w-2/4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {property.title}
                        </h3>
                        <div className="flex space-x-2">
                          <Badge variant={property.isActive ? 'default' : 'secondary'}>
                            {property.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant={property.isVerified ? 'default' : 'outline'}>
                            {property.isVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {property.location.address}, {property.location.city}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>{property.bhk} BHK</span>
                        <span>•</span>
                        <span>{property.area} sq ft</span>
                        <span>•</span>
                        <span>{property.furnishing}</span>
                        <span>•</span>
                        <span>{property.propertyType}</span>
                      </div>

                      <div className="flex items-center text-gray-600 mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          Listed on {new Date(property.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-gray-700 text-sm line-clamp-2">
                        {property.description}
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="lg:w-1/4 flex flex-col justify-between">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {formatCurrency(property.rent)}/month
                        </div>
                        <div className="text-sm text-gray-500">
                          Deposit: {formatCurrency(property.deposit)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link href={`/properties/${property._id}`}>
                          <Button variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/properties/${property._id}/edit`}>
                          <Button variant="outline" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => togglePropertyStatus(property._id, property.isActive)}
                        >
                          {property.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteProperty(property._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
