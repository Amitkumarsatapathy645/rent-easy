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

export default function ClientNewPropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    deposit: '',
    bhk: '',
    furnishing: 'Fully Furnished',
    propertyType: 'Apartment',
    area: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      coordinates: { lat: '', lng: '' },
    },
    amenities: '',
    availableFrom: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCoordinateHelper, setShowCoordinateHelper] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // CLIENT-SIDE VALIDATION: Enhanced coordinate validation
    const lat = parseFloat(formData.location.coordinates.lat);
    const lng = parseFloat(formData.location.coordinates.lng);

    if (!formData.location.coordinates.lat || !formData.location.coordinates.lng) {
      setError('Latitude and longitude coordinates are required');
      setLoading(false);
      return;
    }

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid numeric coordinates (use decimal format like 28.6139)');
      setLoading(false);
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90 degrees');
      setLoading(false);
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180 degrees');
      setLoading(false);
      return;
    }

    if (lat === 0 && lng === 0) {
      setError('Please enter valid property coordinates. Use Google Maps to find the exact location.');
      setLoading(false);
      return;
    }

    // Validate images
    if (images.length === 0) {
      setError('Please upload at least one property image');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('rent', formData.rent);
    data.append('deposit', formData.deposit);
    data.append('bhk', formData.bhk);
    data.append('furnishing', formData.furnishing);
    data.append('propertyType', formData.propertyType);
    data.append('area', formData.area);
    data.append('location.address', formData.location.address);
    data.append('location.city', formData.location.city);
    data.append('location.state', formData.location.state);
    data.append('location.pincode', formData.location.pincode);
    
    // ENSURE: Proper coordinate format
    data.append('location.coordinates.lat', lat.toString());
    data.append('location.coordinates.lng', lng.toString());
    
    data.append('amenities', formData.amenities);
    data.append('availableFrom', formData.availableFrom);
    images.forEach((image) => data.append('images', image));

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage('Property created successfully! Redirecting...');
        setTimeout(() => router.push('/dashboard/owner'), 2000);
      } else {
        setError(result.error || 'Failed to create property');
        setLoading(false);
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      if (key === 'coordinates') {
        const coordKey = name.split('.')[2];
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            coordinates: { ...formData.location.coordinates, [coordKey]: value },
          },
        });
      } else {
        setFormData({
          ...formData,
          location: { ...formData.location, [key]: value },
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      
      // Validate file types and sizes
      const invalidFiles = fileList.filter(file => 
        !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024
      );
      
      if (invalidFiles.length > 0) {
        setError('Please select only image files under 5MB each');
        return;
      }
      
      setImages(fileList);
      setError(''); // Clear any previous error
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            coordinates: {
              lat: position.coords.latitude.toFixed(6),
              lng: position.coords.longitude.toFixed(6),
            }
          }
        });
        setLoading(false);
        setSuccessMessage('Location detected successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      (error) => {
        setLoading(false);
        setError('Could not get current location. Please enter coordinates manually or enable location services.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">List New Property</CardTitle>
          <CardDescription>Add a new property to RentEasy</CardDescription>
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
            {/* Basic Information */}
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Beautiful 2BHK Apartment in Bandra"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property in detail..."
                className="w-full p-2 border rounded-md"
                rows={4}
                required
                disabled={loading}
              />
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rent">Monthly Rent (₹) *</Label>
                <Input
                  id="rent"
                  name="rent"
                  type="number"
                  value={formData.rent}
                  onChange={handleChange}
                  placeholder="25000"
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
                  placeholder="50000"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bhk">BHK *</Label>
                <Input
                  id="bhk"
                  name="bhk"
                  type="number"
                  value={formData.bhk}
                  onChange={handleChange}
                  placeholder="2"
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
                  onValueChange={(value: string) => setFormData({ ...formData, furnishing: value })}
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
                  onValueChange={(value: string) => setFormData({ ...formData, propertyType: value })}
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

            <div>
              <Label htmlFor="area">Carpet Area (sq ft) *</Label>
              <Input
                id="area"
                name="area"
                type="number"
                value={formData.area}
                onChange={handleChange}
                placeholder="1200"
                required
                disabled={loading}
              />
            </div>

            {/* Location Details */}
            <div>
              <Label htmlFor="location.address">Complete Address *</Label>
              <Input
                id="location.address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="Building name, street, area"
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
                  placeholder="Mumbai"
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
                  placeholder="Maharashtra"
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
                placeholder="400050"
                pattern="[0-9]{6}"
                required
                disabled={loading}
              />
            </div>

            {/* Coordinates Section */}
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
                    placeholder="19.0760"
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
                    placeholder="72.8777"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-3 flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={loading}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Use Current Location
                </Button>
              </div>

              {showCoordinateHelper && (
                <div className="mt-3 bg-white border rounded-md p-3 text-sm">
                  <p className="font-medium text-blue-900 mb-2">How to find coordinates:</p>
                  <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Open Google Maps and search for your property address</li>
                    <li>Click on the exact location of your property</li>
                    <li>Right-click on the red pin that appears</li>
                    <li>Click on the coordinates (numbers like "19.0760, 72.8777")</li>
                    <li>Copy first number as Latitude, second as Longitude</li>
                  </ol>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <strong>Examples:</strong><br/>
                    Mumbai: 19.0760, 72.8777<br/>
                    Delhi: 28.6139, 77.2090<br/>
                    Bangalore: 12.9716, 77.5946
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="Parking, WiFi, Gym, Swimming Pool, Security"
                disabled={loading}
              />
            </div>

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

            <div>
              <Label htmlFor="images">Property Images * (Max 5MB each)</Label>
              <Input
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={loading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload at least one image. Supported formats: JPG, PNG, WebP
              </p>
              {images.length > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  {images.length} image(s) selected
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Property...
                </span>
              ) : (
                'Create Property Listing'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/dashboard/owner" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
