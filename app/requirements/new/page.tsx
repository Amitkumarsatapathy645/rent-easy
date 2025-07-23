'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, Home } from 'lucide-react';
import Link from 'next/link';

export default function PostRequirementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxRent: '',
    bhk: '',
    furnishing: 'Any',
    propertyType: 'Any',
    city: '',
    state: '',
    preferredAreas: '',
    amenities: '',
    moveInDate: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!session) {
      router.push('/auth/signin?callbackUrl=/requirements/new');
      return;
    }

    try {
      const response = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preferredAreas: formData.preferredAreas.split(',').map(area => area.trim()),
          amenities: formData.amenities.split(',').map(amenity => amenity.trim()),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/requirements');
      } else {
        setError(data.error || 'Failed to post requirement');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Post Housing Requirement</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Looking for 2BHK apartment in Mumbai"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your requirements in detail..."
                  className="w-full p-3 border rounded-md"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxRent">Maximum Budget (₹/month)</Label>
                  <Input
                    id="maxRent"
                    name="maxRent"
                    type="number"
                    value={formData.maxRent}
                    onChange={handleChange}
                    placeholder="25000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bhk">BHK</Label>
                  <Input
                    id="bhk"
                    name="bhk"
                    type="number"
                    value={formData.bhk}
                    onChange={handleChange}
                    placeholder="2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="furnishing">Furnishing Preference</Label>
                  <Select
                    value={formData.furnishing}
                    onValueChange={(value) => setFormData({ ...formData, furnishing: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any</SelectItem>
                      <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                      <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                      <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="preferredAreas">Preferred Areas (comma-separated)</Label>
                <Input
                  id="preferredAreas"
                  name="preferredAreas"
                  value={formData.preferredAreas}
                  onChange={handleChange}
                  placeholder="Andheri, Bandra, Powai"
                />
              </div>

              <div>
                <Label htmlFor="amenities">Desired Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="Parking, Gym, Swimming Pool"
                />
              </div>

              <div>
                <Label htmlFor="moveInDate">Move-in Date</Label>
                <Input
                  id="moveInDate"
                  name="moveInDate"
                  type="date"
                  value={formData.moveInDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Requirement'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/requirements" className="text-blue-600 hover:text-blue-500">
                ← View All Requirements
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
