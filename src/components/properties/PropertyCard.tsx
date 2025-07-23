import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Home, Bed } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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

interface PropertyCardProps {
  property: Property;
  onBookmark?: (propertyId: string) => void;
  isBookmarked?: boolean;
}

export default function PropertyCard({ property, onBookmark, isBookmarked }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
          alt={property.title}
          fill
          className="object-cover"
        />
        {onBookmark && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={() => onBookmark(property._id)}
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            {property.propertyType}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(property.rent)}/month
            </div>
            <div className="text-sm text-gray-500">
              Deposit: {formatCurrency(property.deposit)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm line-clamp-1">{property.location.address}, {property.location.city}</span>
        </div>
        
        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bhk} BHK</span>
          </div>
          <div className="flex items-center">
            <Home className="h-4 w-4 mr-1" />
            <span>{property.area} sq ft</span>
          </div>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {property.furnishing}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            By {property.ownerName}
          </div>
          <Link href={`/properties/${property._id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
