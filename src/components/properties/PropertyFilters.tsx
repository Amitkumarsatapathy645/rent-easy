import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';

interface FilterState {
  location: string;
  minRent: string;
  maxRent: string;
  bhk: string;
  furnishing: string;
  propertyType: string;
}

interface PropertyFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    minRent: '',
    maxRent: '',
    bhk: '',
    furnishing: '',
    propertyType: '',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      location: '',
      minRent: '',
      maxRent: '',
      bhk: '',
      furnishing: '',
      propertyType: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="City, area, or landmark"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Min Rent</label>
            <Input
              type="number"
              placeholder="₹ 0"
              value={filters.minRent}
              onChange={(e) => handleFilterChange('minRent', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Rent</label>
            <Input
              type="number"
              placeholder="₹ 100000"
              value={filters.maxRent}
              onChange={(e) => handleFilterChange('maxRent', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">BHK</label>
          <select
            className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
            value={filters.bhk}
            onChange={(e) => handleFilterChange('bhk', e.target.value)}
          >
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Furnishing</label>
          <select
            className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
            value={filters.furnishing}
            onChange={(e) => handleFilterChange('furnishing', e.target.value)}
          >
            <option value="">Any</option>
            <option value="Fully Furnished">Fully Furnished</option>
            <option value="Semi Furnished">Semi Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Property Type</label>
          <select
            className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          >
            <option value="">Any</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Studio">Studio</option>
            <option value="PG">PG</option>
          </select>
        </div>

        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}