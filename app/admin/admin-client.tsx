'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Eye, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  UserCheck,
  Home,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalViews: number;
  totalInquiries: number;
  activeProperties: number;
  verifiedProperties: number;
  pendingVerifications: number;
  monthlyUsers: number;
  monthlyProperties: number;
  usersByRole: Array<{ _id: string; count: number }>;
  topCities: Array<{ _id: string; count: number }>;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentProperties: Array<{
    _id: string;
    title: string;
    ownerName: string;
    location: { city: string };
    isVerified: boolean;
    createdAt: string;
  }>;
}

interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: "tenant" | "owner" | "admin";
  };
}

export default function AdminDashboardClient({ session }: { session: Session }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        setError(data.error || 'Failed to fetch admin stats');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2 text-red-700 mb-4">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <Button onClick={fetchAdminStats} className="w-full">
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, <span className="font-semibold">{session.user.name}</span>! 
              Manage the RentEasy platform.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-sm text-green-600">+{stats.monthlyUsers} this month</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                  <p className="text-sm text-green-600">+{stats.monthlyProperties} this month</p>
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
                  <p className="text-sm font-medium text-gray-600">Platform Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">All time</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</p>
                  <p className="text-sm text-orange-600">All time</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage user accounts, roles, and permissions</p>
              <div className="space-y-2 mb-4">
                {stats.usersByRole.map((role) => (
                  <div key={role._id} className="flex justify-between items-center">
                    <span className="capitalize text-sm">{role._id}s:</span>
                    <Badge variant="outline">{role.count}</Badge>
                  </div>
                ))}
              </div>
              <Link href="/admin/users">
                <Button className="w-full">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Property Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Property Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Review and verify property listings</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active:</span>
                  <Badge variant="default">{stats.activeProperties}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Verified:</span>
                  <Badge variant="outline">{stats.verifiedProperties}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending:</span>
                  <Badge variant="destructive">{stats.pendingVerifications}</Badge>
                </div>
              </div>
              <Link href="/admin/properties">
                <Button className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Properties
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics & Reports */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics & Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View detailed platform analytics and insights</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Top City:</span>
                  <Badge variant="outline">
                    {stats.topCities[0]?._id || 'N/A'} ({stats.topCities[0]?.count || 0})
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Conversion:</span>
                  <Badge variant="outline">
                    {stats.totalViews > 0 ? ((stats.totalInquiries / stats.totalViews) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </div>
              <Link href="/admin/analytics">
                <Button className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Users
                </span>
                <Link href="/admin/users">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'owner' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Recent Properties
                </span>
                <Link href="/admin/properties">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentProperties.slice(0, 5).map((property) => (
                  <div key={property._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium line-clamp-1">{property.title}</p>
                      <p className="text-sm text-gray-600">
                        by {property.ownerName} in {property.location.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={property.isVerified ? 'default' : 'destructive'}>
                        {property.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(property.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/properties?filter=pending">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <span>Review Pending Properties</span>
                  <Badge variant="destructive">{stats.pendingVerifications}</Badge>
                </Button>
              </Link>
              
              <Link href="/admin/users?filter=recent">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <span>Review New Users</span>
                  <Badge variant="default">{stats.monthlyUsers}</Badge>
                </Button>
              </Link>
              
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                  <span>View Analytics</span>
                  <Badge variant="outline">Live Data</Badge>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
