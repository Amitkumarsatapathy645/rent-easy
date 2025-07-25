'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  viewCount?: number;
  inquiryCount?: number;
}

interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'tenant' | 'owner' | 'admin';
  };
}

export default function AdminPropertiesClient({ session }: { session: Session }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    // Check URL params for filters
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    if (filter === 'pending') {
      setVerificationFilter('pending');
    }
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, statusFilter, verificationFilter]);

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/properties');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to fetch properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(property => property.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(property => !property.isActive);
      }
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      if (verificationFilter === 'verified') {
        filtered = filtered.filter(property => property.isVerified);
      } else if (verificationFilter === 'pending') {
        filtered = filtered.filter(property => !property.isVerified);
      }
    }

    setFilteredProperties(filtered);
  };

  const handlePropertyAction = async (propertyId: string, action: 'verify' | 'reject' | 'activate' | 'deactivate') => {
    setActionLoading(propertyId);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        fetchProperties(); // Refresh the property list
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Action failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
            <p className="text-gray-600 mt-2">
              Manage and verify property listings ({filteredProperties.length} properties)
            </p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={fetchProperties} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>{message}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="h-10 px-3 border border-gray-300 rounded-md"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setVerificationFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600">
                {properties.length === 0 ? 'No properties have been listed yet.' : 'Try adjusting your filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
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
                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="flex space-x-2 ml-4">
                          <Badge variant={property.isActive ? 'default' : 'secondary'}>
                            {property.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant={property.isVerified ? 'default' : 'destructive'}>
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

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>Owner: {property.ownerName}</span>
                        <span>•</span>
                        <span>Views: {property.viewCount || 0}</span>
                        <span>•</span>
                        <span>Inquiries: {property.inquiryCount || 0}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          Listed on {new Date(property.createdAt).toLocaleDateString()}
                        </span>
                      </div>
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
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Property
                          </Button>
                        </Link>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              disabled={actionLoading === property._id}
                            >
                              {actionLoading === property._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <MoreHorizontal className="h-4 w-4 mr-2" />
                                  Actions
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Property Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {!property.isVerified && (
                              <DropdownMenuItem
                                onClick={() => handlePropertyAction(property._id, 'verify')}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify Property
                              </DropdownMenuItem>
                            )}
                            
                            {!property.isVerified && (
                              <DropdownMenuItem
                                onClick={() => handlePropertyAction(property._id, 'reject')}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Property
                              </DropdownMenuItem>
                            )}
                            
                            {property.isActive ? (
                              <DropdownMenuItem
                                onClick={() => handlePropertyAction(property._id, 'deactivate')}
                                className="text-orange-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handlePropertyAction(property._id, 'activate')}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
