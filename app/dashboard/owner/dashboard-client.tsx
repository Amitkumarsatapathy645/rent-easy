'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  Building2,
  Plus,
  BarChart3,
  Users,
  Settings,
  Eye,
  TrendingUp,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Session } from "next-auth";

interface OwnerDashboardClientProps {
  session: Session;
}

interface Stats {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  totalInquiries: number;
}

export default function OwnerDashboardClient({ session }: OwnerDashboardClientProps) {
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Owner Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Welcome back,{" "}
              <span className="text-blue-600 font-semibold">
                {session.user.name}
              </span>
              ! Manage your properties and track your success.
            </p>
          </div>

          {/* Real Data Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.totalProperties || 0}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.activeProperties || 0}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.totalViews || 0}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inquiries</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.totalInquiries || 0}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Property Management */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Property Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6 text-center">
                  Add new properties and manage your existing listings
                </p>
                <div className="space-y-4">
                  <Link href="/proproperties/new" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-5 w-5 mr-2" />
                      List New Property
                    </Button>
                  </Link>
                  <Link href="/dashboard/owner/properties" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Building2 className="h-5 w-5 mr-2" />
                      View My Properties
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Analytics & Reports */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6 text-center">
                  Track your property performance and get insights
                </p>
                <div className="space-y-4">
                  <Link href="/dashboard/owner/analytics">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                  <Link href="/dashboard/owner/analytics/performance">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Performance Reports
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Account & Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Account & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6 text-center">
                  Manage your account settings and preferences
                </p>
                <div className="space-y-4">
                  <Link href="/dashboard/owner/settings">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <Settings className="h-5 w-5 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                  <Link href="/dashboard/owner/profile">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Manage Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-12 text-center">
            <Link href="/">
              <Button
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
