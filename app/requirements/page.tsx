'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  Plus,
  Filter,
  Search,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface Requirement {
  _id: string;
  title: string;
  description: string;
  maxRent: number;
  bhk: number;
  furnishing: string;
  propertyType: string;
  location: {
    city: string;
    state: string;
    preferredAreas: string[];
  };
  amenities: string[];
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function RequirementsPage() {
  const { data: session } = useSession();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const response = await fetch('/api/requirements');
      const data = await response.json();

      if (response.ok) {
        setRequirements(data);
      } else {
        setError(data.error || 'Failed to fetch requirements');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Requirements</h1>
            <p className="text-gray-600 mt-2">
              {requirements.length} active requirements from tenants
            </p>
          </div>
          
          <div className="flex space-x-4">
            {session?.user.role === 'tenant' && (
              <Link href="/requirements/new">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Requirement
                </Button>
              </Link>
            )}
            <Link href="/properties">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {requirements.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No requirements posted yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to post your housing requirement.
            </p>
            {session?.user.role === 'tenant' && (
              <Link href="/requirements/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your Requirement
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {requirements.map((requirement) => (
              <Card key={requirement._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Requirement Details */}
                    <div className="lg:w-2/3">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {requirement.title}
                        </h3>
                        <Badge variant={requirement.isActive ? 'default' : 'secondary'}>
                          {requirement.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {requirement.location.city}, {requirement.location.state}
                          {requirement.location.preferredAreas.length > 0 && (
                            <span className="ml-2 text-sm">
                              ({requirement.location.preferredAreas.join(', ')})
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>{requirement.bhk} BHK</span>
                        <span>•</span>
                        <span>{requirement.furnishing}</span>
                        <span>•</span>
                        <span>{requirement.propertyType}</span>
                      </div>

                      <div className="flex items-center text-gray-600 mb-3">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Move-in by: {new Date(requirement.moveInDate).toLocaleDateString()}</span>
                      </div>

                      <p className="text-gray-700 mb-4">{requirement.description}</p>

                      {requirement.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {requirement.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="text-sm text-gray-500">
                        Posted on {new Date(requirement.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Budget & Contact */}
                    <div className="lg:w-1/3 flex flex-col justify-between">
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-lg font-semibold text-gray-900">
                            Budget: {formatCurrency(requirement.maxRent)}/month
                          </span>
                        </div>
                      </div>

                      {session?.user.role === 'owner' && (
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Contact Tenant</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-600" />
                                <span>{requirement.tenantName}</span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-gray-600" />
                                <span>{requirement.tenantEmail}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-gray-600" />
                                <span>{requirement.tenantPhone}</span>
                              </div>
                            </div>
                            <a href={`mailto:${requirement.tenantEmail}`} className="block mt-3">
                              <Button size="sm" className="w-full">
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Now
                              </Button>
                            </a>
                          </CardContent>
                        </Card>
                      )}
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
