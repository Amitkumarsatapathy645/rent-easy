// In dashboard/owner/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, Users, Building2 } from 'lucide-react';

interface Stats {
  totalViews: number;
  totalInquiries: number;
  activeProperties: number;
  verifiedProperties: number;
  conversionRate: number;
  trends: {
    views: { current: number; previous: number };
    inquiries: { current: number; previous: number };
  };
  recentInquiries: {
    tenantName: string;
    message: string;
    createdAt: string;
    status: string;
  }[];
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrendPercentage = (current:any, previous:any) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
                  <p className="text-sm text-green-600">
                    +{calculateTrendPercentage(stats?.trends?.views?.current, stats?.trends?.views?.previous)}% this month
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Inquiries</p>
                  <p className="text-2xl font-bold">{stats?.totalInquiries || 0}</p>
                  <p className="text-sm text-green-600">
                    +{calculateTrendPercentage(stats?.trends?.inquiries?.current, stats?.trends?.inquiries?.previous)}% this month
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Properties</p>
                  <p className="text-2xl font-bold">{stats?.activeProperties || 0}</p>
                  <p className="text-sm text-blue-600">
                    {stats?.verifiedProperties || 0} verified
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{stats?.conversionRate || 0}%</p>
                  <p className="text-sm text-gray-600">Views to inquiries</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentInquiries?.map((inquiry, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{inquiry.tenantName}</p>
                    <p className="text-sm text-gray-600">{inquiry.message}</p>
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
      </div>
    </div>
  );
}
