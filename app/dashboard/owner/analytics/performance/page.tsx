'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  TrendingUp, 
  Eye, 
  Users, 
  Calendar, 
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface PerformanceData {
  summary: {
    totalViews: number;
    totalInquiries: number;
    avgResponseTime: string;
    conversionRate: string;
  };
  trends: {
    views: { current: number; previous: number; change: number };
    inquiries: { current: number; previous: number; change: number };
  };
  topProperties: Array<{
    _id: string;
    property?: Array<{ title: string }>;
    viewCount: number;
    inquiryCount?: number;
    conversionRate?: number;
  }>;
  recentInquiries: Array<{
    _id: string;
    tenantName: string;
    message: string;
    createdAt: string;
    status: 'pending' | 'responded' | 'closed';
  }>;
}

export default function PerformanceReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dateRange, setDateRange] = useState('30');
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/dashboard/owner/analytics/performance');
      return;
    }
    if (session.user.role !== 'owner') {
      router.push('/');
      return;
    }
    fetchPerformanceData();
  }, [session, router, dateRange]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/dashboard/stats?period=${dateRange}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch performance data');
      }
      
      // Transform API data to match component expectations
      const transformedData: PerformanceData = {
        summary: {
          totalViews: data.totalViews || 0,
          totalInquiries: data.totalInquiries || 0,
          avgResponseTime: data.avgResponseTime || 'N/A',
          conversionRate: `${data.conversionRate || 0}%`,
        },
        trends: {
          views: { 
            current: data.totalViews || 0, 
            previous: data.trends?.views?.previous || 0, 
            change: data.trends?.views ? 
              parseFloat(((data.trends.views.current - data.trends.views.previous) / 
                Math.max(data.trends.views.previous, 1) * 100).toFixed(1)) : 0
          },
          inquiries: { 
            current: data.totalInquiries || 0, 
            previous: data.trends?.inquiries?.previous || 0,
            change: data.trends?.inquiries ? 
              parseFloat(((data.trends.inquiries.current - data.trends.inquiries.previous) / 
                Math.max(data.trends.inquiries.previous, 1) * 100).toFixed(1)) : 0
          },
        },
        topProperties: (data.propertyPerformance || []).map((prop: any) => ({
          _id: prop._id,
          property: prop.property || [{ title: 'Property' }],
          viewCount: prop.viewCount || 0,
          inquiryCount: prop.inquiryCount || 0,
          conversionRate: prop.viewCount ? 
            parseFloat(((prop.inquiryCount || 0) / prop.viewCount * 100).toFixed(1)) : 0
        })),
        recentInquiries: data.recentInquiries || []
      };

      setPerformanceData(transformedData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2 text-red-700 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
            <div className="text-center">
              <Button onClick={() => fetchPerformanceData()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
            <p className="text-gray-600 mt-2">
              Detailed insights into your property performance over the last {dateRange} days
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
            </select>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Link href="/dashboard/owner/analytics">
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Back to Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {performanceData?.summary.totalViews.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getTrendIcon(performanceData?.trends.views.change || 0)}
                <span className={`ml-2 text-sm ${getTrendColor(performanceData?.trends.views.change || 0)}`}>
                  {Math.abs(performanceData?.trends.views.change || 0)}% from previous period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {performanceData?.summary.totalInquiries || 0}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getTrendIcon(performanceData?.trends.inquiries.change || 0)}
                <span className={`ml-2 text-sm ${getTrendColor(performanceData?.trends.inquiries.change || 0)}`}>
                  {Math.abs(performanceData?.trends.inquiries.change || 0)}% from previous period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {performanceData?.summary.avgResponseTime || 'N/A'}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowDown className="h-4 w-4 text-green-600" />
                <span className="ml-2 text-sm text-green-600">Faster than average</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {performanceData?.summary.conversionRate || '0%'}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUp className="h-4 w-4 text-green-600" />
                <span className="ml-2 text-sm text-green-600">Views to inquiries</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Properties */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Performing Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData?.topProperties && performanceData.topProperties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Property</th>
                      <th className="text-left py-3 px-4">Views</th>
                      <th className="text-left py-3 px-4">Inquiries</th>
                      <th className="text-left py-3 px-4">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.topProperties.map((property, index) => (
                      <tr key={property._id || index} className="border-b">
                        <td className="py-3 px-4 font-medium">
                          {property.property?.[0]?.title || `Property ${index + 1}`}
                        </td>
                        <td className="py-3 px-4">{property.viewCount}</td>
                        <td className="py-3 px-4">{property.inquiryCount || 0}</td>
                        <td className="py-3 px-4">{property.conversionRate || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No property performance data available for the selected period.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        {performanceData?.recentInquiries && performanceData.recentInquiries.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.recentInquiries.map((inquiry, index) => (
                  <div key={inquiry._id || index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{inquiry.tenantName}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{inquiry.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        inquiry.status === 'responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Chart visualization coming soon</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total views: {performanceData?.summary.totalViews || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inquiries vs Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Chart visualization coming soon</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Conversion rate: {performanceData?.summary.conversionRate || '0%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
