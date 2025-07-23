import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Users, Building2 } from 'lucide-react';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin?callbackUrl=/admin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Welcome, {session.user.name}! Manage the platform below.</p>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Platform Management</h3>
              <div className="flex space-x-4">
                <Link href="/admin/users">
                  <Button className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/properties">
                  <Button className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Properties
                  </Button>
                </Link>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}