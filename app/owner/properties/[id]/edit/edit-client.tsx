'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, MapPin, Info } from 'lucide-react';
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
    coordinates: { lat: number; lng: number };
  };
  amenities: string[];
  images: string[];
  availableFrom: string;
}

interface Props {
  property: Property;
}

export default function EditPropertyClient({ property }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: property.title,
    description: property.description,
    rent: property.rent.toString(),
    deposit: property.deposit.toString(),
    bhk: property.bhk.toString(),
    furnishing: property.furnishing,
    propertyType: property.propertyType,
    area: property.area.toString(),
    location: {
      address: property.location.address,
      city: property.location.city,
      state: property.location.state,
      pincode: property.location.pincode,
      coordinates: {
        lat: property.location.coordinates.lat.toString(),
        lng: property.location.coordinates.lng.toString(),
      },
    },
    amenities: property.amenities.join(', '),
    availableFrom: property.availableFrom.split('T')[0], // Format for date input
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCoordinateHelper, setShowCoordinateHelper] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validation
    const lat = parseFloat(formData.location.coordinates.lat);
    const lng = parseFloat(formData.location.coordinates.lng);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid coordinates');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/properties/${property._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          rent: parseFloat(formData.rent),
          deposit: parseFloat(formData.deposit),
          bhk: parseInt(formData.bhk),
          furnishing: formData.furnishing,
          propertyType: formData.propertyType,
          area: parseFloat(formData.area),
          location: {
            address: formData.location.address,
            city: formData.location.city,
            state: formData.location.state,
            pincode: formData.location.pincode,
            coordinates: { lat, lng }
          },
          amenities: formData.amenities.split(',').map(item => item.trim()).filter(item => item.length > 0),
          availableFrom: formData.availableFrom,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage('Property updated successfully! Redirecting...');
        setTimeout(() => router.push('/dashboard/owner/properties'), 2000);
      } else {
        setError(result.error || 'Failed to update property');
        setLoading(false);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.coordinates.')) {
      const coordKey = name.split('.')[2];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          coordinates: { ...formData.location.coordinates, [coordKey]: value },
        },
      });
    } else if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [key]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Property</CardTitle>
          <CardDescription>Update your property details</CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center space-x-2 text-green-700 mb-4">
              <span className="text-sm">{successMessage}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2 text-red-700 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                rows={4}
                required
                disabled={loading}
              />
            </div>

            {/* Rent and Deposit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rent">Monthly Rent (₹) *</Label>
                <Input
                  id="rent"
                  name="rent"
                  type="number"
                  value={formData.rent}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="deposit">Security Deposit (₹) *</Label>
                <Input
                  id="deposit"
                  name="deposit"
                  type="number"
                  value={formData.deposit}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* BHK, Furnishing, Property Type */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bhk">BHK *</Label>
                <Input
                  id="bhk"
                  name="bhk"
                  type="number"
                  value={formData.bhk}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="furnishing">Furnishing *</Label>
                <Select
                  value={formData.furnishing}
                  onValueChange={(value) => setFormData({ ...formData, furnishing: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                    <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                    <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="PG">PG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area */}
            <div>
              <Label htmlFor="area">Carpet Area (sq ft) *</Label>
              <Input
                id="area"
                name="area"
                type="number"
                value={formData.area}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Location Fields */}
            <div>
              <Label htmlFor="location.address">Complete Address *</Label>
              <Input
                id="location.address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location.city">City *</Label>
                <Input
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="location.state">State *</Label>
                <Input
                  id="location.state"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location.pincode">Pincode *</Label>
              <Input
                id="location.pincode"
                name="location.pincode"
                value={formData.location.pincode}
                onChange={handleChange}
                pattern="[0-9]{6}"
                required
                disabled={loading}
              />
            </div>

            {/* Coordinates */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Property Coordinates *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCoordinateHelper(!showCoordinateHelper)}
                  disabled={loading}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Help
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location.coordinates.lat">Latitude *</Label>
                  <Input
                    id="location.coordinates.lat"
                    name="location.coordinates.lat"
                    type="number"
                    step="any"
                    value={formData.location.coordinates.lat}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="location.coordinates.lng">Longitude *</Label>
                  <Input
                    id="location.coordinates.lng"
                    name="location.coordinates.lng"
                    type="number"
                    step="any"
                    value={formData.location.coordinates.lng}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {showCoordinateHelper && (
                <div className="mt-3 bg-white border rounded-md p-3 text-sm">
                  <p className="font-medium text-blue-900 mb-2">How to find coordinates:</p>
                  <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Open Google Maps and search for your property address</li>
                    <li>Right-click on the exact location of your property</li>
                    <li>Click on the coordinates that appear</li>
                    <li>Copy first number as Latitude, second as Longitude</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="Parking, WiFi, Gym, Swimming Pool"
                disabled={loading}
              />
            </div>

            {/* Available From */}
            <div>
              <Label htmlFor="availableFrom">Available From *</Label>
              <Input
                id="availableFrom"
                name="availableFrom"
                type="date"
                value={formData.availableFrom}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating Property...
                </span>
              ) : (
                'Update Property'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center space-x-4">
            <Link href="/dashboard/owner/properties" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Properties
            </Link>
            <Link href={`/proproperties/${property._id}`} className="text-sm text-blue-600 hover:text-blue-500">
              View Property
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
