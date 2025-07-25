'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Eye,
  ArrowLeft,
  Download,
  RefreshCw,
  DollarSign,
  Activity,
  Calendar,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalProperties: number;
    totalViews: number;
    totalInquiries: number;
    conversionRate: number;
  };
  growth: {
    userGrowth: number;
    propertyGrowth: number;
    viewGrowth: number;
    inquiryGrowth: number;
  };
  topCities: Array<{ _id: string; count: number; percentage: number }>;
  propertyTypes: Array<{ _id: string; count: number; percentage: number }>;
  monthlyStats: Array<{
    month: string;
    users: number;
    properties: number;
    views: number;
    inquiries: number;
  }>;
  recentActivity: Array<{
    type: 'user_signup' | 'property_listed' | 'property_viewed' | 'inquiry_made';
    description: string;
    timestamp: string;
  }>;
}

interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'tenant' | 'owner' | 'admin';
  };
}

export default function AdminAnalyticsClient({ session }: { session: Session }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/analytics?period=${dateRange}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalytics(data);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const data = {
      overview: analytics.overview,
      growth: analytics.growth,
      topCities: analytics.topCities,
      propertyTypes: analytics.propertyTypes,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renteasy-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2 text-red-700 mb-4">
              <span>{error}</span>
            </div>
            <Button onClick={fetchAnalytics} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive insights into platform performance
            </p>
          </div>
          <div className="flex space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button onClick={exportAnalytics} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
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

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalUsers}</p>
                  <p className={`text-sm ${analytics.growth.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.growth.userGrowth >= 0 ? '+' : ''}{analytics.growth.userGrowth}% growth
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalProperties}</p>
                  <p className={`text-sm ${analytics.growth.propertyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.growth.propertyGrowth >= 0 ? '+' : ''}{analytics.growth.propertyGrowth}% growth
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalViews.toLocaleString()}</p>
                  <p className={`text-sm ${analytics.growth.viewGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.growth.viewGrowth >= 0 ? '+' : ''}{analytics.growth.viewGrowth}% growth
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.conversionRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Views to inquiries</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Cities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Top Cities by Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCities.slice(0, 5).map((city, index) => (
                  <div key={city._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="font-medium">{city._id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${city.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{city.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Property Types Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.propertyTypes.map((type, index) => (
                  <div key={type._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="font-medium capitalize">{type._id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{type.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'user_signup' ? 'bg-blue-100' :
                    activity.type === 'property_listed' ? 'bg-green-100' :
                    activity.type === 'property_viewed' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    {activity.type === 'user_signup' && <Users className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'property_listed' && <Building2 className="h-4 w-4 text-green-600" />}
                    {activity.type === 'property_viewed' && <Eye className="h-4 w-4 text-purple-600" />}
                    {activity.type === 'inquiry_made' && <TrendingUp className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
