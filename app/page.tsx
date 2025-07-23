'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Home, 
  Users, 
  Shield, 
  MapPin, 
  Heart, 
  Star, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Plus,
  Building2,
  BarChart3,
  DollarSign
} from 'lucide-react';

interface OwnerStats {
  totalProperties: number;
  activeProperties: number;
  totalRent: number;
  monthlyInquiries: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [ownerStats, setOwnerStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (session?.user.role === 'owner') {
      fetchOwnerStats();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchOwnerStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setOwnerStats(data);
    } catch (error) {
      console.error('Error fetching owner stats:', error);
    } finally {
      setLoading(false);
    }
  };
  // Owner-specific home page content
  const OwnerHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Hero Section for Owners */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Maximize Your
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
                Property Revenue
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Welcome back, <span className="font-semibold text-purple-600">{session?.user.name}</span>! 
              Manage your properties, track performance, and connect with quality tenants.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-200">
            <Link href="/properties/new">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="mr-2 h-5 w-5" />
                List New Property
              </Button>
            </Link>
            <Link href="/dashboard/owner">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Owner Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up animation-delay-400">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Properties</h3>
            <p className="text-3xl font-bold text-purple-600">
              {loading ? '...' : (ownerStats?.totalProperties || 0)}
            </p>
            <p className="text-sm text-gray-600">
              {loading ? '...' : (ownerStats?.activeProperties || 0)} Active Listings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-blue-600">
              {loading ? '...' : `₹${((ownerStats?.totalRent || 0) / 100000).toFixed(1)}L`}
            </p>
            <p className="text-sm text-gray-600">Total Potential</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiries</h3>
            <p className="text-3xl font-bold text-green-600">
              {loading ? '...' : (ownerStats?.monthlyInquiries || 0)}
            </p>
            <p className="text-sm text-gray-600">This Month</p>
          </CardContent>
        </Card>
      </div>
      {/* ... rest of component ... */}
    </div>
      </section>

      {/* Owner Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Grow Your Property Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage and grow your rental property portfolio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <DollarSign className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Maximize Revenue</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Set competitive prices and track your rental income with detailed analytics
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Quality Tenants</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Connect with verified tenants who are seriously looking for rental properties
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Smart Analytics</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Track property performance, views, and inquiries with comprehensive reports
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions for Owners */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to List Your Property?
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90">
            Start earning from your property today with our easy listing process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties/new">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="mr-2 h-5 w-5" />
                List Property Now
              </Button>
            </Link>
            <Link href="/dashboard/owner/analytics">
              <Button size="lg" variant="outline" className="border-2 border-white text-purple-600 hover:bg-white hover:text-purple-600 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

  // Tenant-specific home page content (original)
  const TenantHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section for Tenants */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {session ? `Welcome back, ${session.user.name}!` : 'Find Your Perfect'}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                {session ? 'Find Your Dream Home' : 'Rental Home'}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover thousands of verified rental properties and connect directly with owners. 
              Your dream home is just a click away.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-200">
            <Link href="/properties">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Search className="mr-2 h-5 w-5" />
                Browse Properties
              </Button>
            </Link>
            {session && (
              <Link href="/bookmarks">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Heart className="mr-2 h-5 w-5" />
                  My Bookmarks
                </Button>
              </Link>
            )}
          </div>

          {/* Quick Search */}
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up animation-delay-400">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Search by city, area, or landmark..."
                    className="w-full h-14 px-6 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                  />
                </div>
                <select className="h-14 px-6 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg">
                  <option>Property Type</option>
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Villa</option>
                  <option>PG</option>
                </select>
                <select className="h-14 px-6 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg">
                  <option>Budget</option>
                  <option>Under ₹10,000</option>
                  <option>₹10,000 - ₹25,000</option>
                  <option>₹25,000 - ₹50,000</option>
                  <option>Above ₹50,000</option>
                </select>
              </div>
              <Link href="/properties">
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" size="lg">
                  <Search className="mr-2 h-5 w-5" />
                  Search Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rest of the tenant-focused content */}
      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">10,000+</div>
              <div className="text-gray-600">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50,000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose RentEasy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make finding rental properties simple, secure, and efficient
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Verified Properties</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  All properties are verified by our team to ensure authenticity and quality
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Location-Based Search</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Find properties near your workplace, schools, or preferred areas
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Direct Contact</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Connect directly with property owners without any middleman
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Find Your Next Home?
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90">
            Join thousands of satisfied users who found their perfect rental match
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Browse Properties
              </Button>
            </Link>
            {!session && (
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Sign Up Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  // Admin gets a different view too
  if (session?.user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome Admin, <span className="text-blue-600">{session.user.name}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Manage the entire RentEasy platform from your admin dashboard
            </p>
            <Link href="/admin">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Go to Admin Dashboard
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Show appropriate content based on user role
  if (session?.user.role === 'owner') {
    return <OwnerHomePage />;
  } else {
    return <TenantHomePage />;
  }
}
