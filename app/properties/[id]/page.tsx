'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle, Loader2, Mail, MapPin, Bed, Heart } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import InquiryForm from '@/components/inquiries/InquiryForm'; // ✅ added import

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
    coordinates: { lat: number; lng: number };
  };
  amenities: string[];
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  isVerified: boolean;
  isActive: boolean;
  availableFrom: string;
}

import { notFound } from 'next/navigation';

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  // Prevent CastError if id is 'new'
  if (params.id === 'new') {
    return notFound();
  }
  const { data: session } = useSession();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false); // ✅ added

  useEffect(() => {
    fetchProperty();
    if (session) {
      checkBookmarkStatus();
    }
  }, [params.id, session]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setProperty(data);

        await fetch(`/api/properties/${params.id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAgent: navigator.userAgent,
            ip: '',
          }),
        });
      } else {
        setError(data.error || 'Failed to load property');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch('/api/bookmarks/user');
      const bookmarks = await response.json();
      if (response.ok) {
        setIsBookmarked(bookmarks.includes(params.id));
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/properties/' + params.id);
      return;
    }

    try {
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch('/api/bookmarks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: params.id }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleInquiry = () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/properties/${params.id}`);
      return;
    }

    if (session.user.role !== 'tenant') {
      alert('Only tenants can send inquiries');
      return;
    }

    setShowInquiryForm(true); // ✅ show modal
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error || 'Property not found'}</span>
            </div>
            <div className="mt-4 text-center">
              <Link href="/properties">
                <Button variant="outline">Back to Properties</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              </div>
              {property.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {property.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square relative">
                      <Image
                        src={image}
                        alt={`Property image ${index + 2}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{property.title}</CardTitle>
                    <div className="flex items-center text-gray-600 mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.location.address}, {property.location.city}</span>
                    </div>
                  </div>
                  {session && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBookmark}
                      className="ml-2"
                    >
                      <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(property.rent)}/month
                      </div>
                      <div className="text-sm text-gray-600">
                        Deposit: {formatCurrency(property.deposit)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Area</div>
                      <div className="font-semibold">{property.area} sq ft</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bhk} BHK</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {property.furnishing}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {property.propertyType}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{property.description}</p>
                  </div>

                  {property.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-gray-600">Available From</div>
                    <div className="font-semibold">
                      {new Date(property.availableFrom).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ✅ Updated Contact Owner Section */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="ml-2 font-semibold">{property.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="ml-2">{property.ownerEmail}</span>
                  </div>
                  {property.ownerPhone && (
                    <div>
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="ml-2">{property.ownerPhone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleInquiry}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Inquiry
                  </Button>

                  <a href={`mailto:${property.ownerEmail}`} className="block">
                    <Button variant="outline" className="w-full">
                      Direct Email
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <Link href="/properties">
            <Button variant="outline">Back to Properties</Button>
          </Link>
        </div>
      </div>

      {/* ✅ Inquiry Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <InquiryForm property={property} onClose={() => setShowInquiryForm(false)} />
        </div>
      )}
    </div>
  );
}
