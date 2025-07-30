"use client";

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Home, Edit2 } from 'lucide-react';
import Link from 'next/link';

export default function TenantProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Profile</h1>
            <p className="text-gray-600 mt-2">View your profile details and update your information.</p>
          </div>
          <Link href="/tenant/settings">
            <Button variant="outline">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <span className="font-medium text-lg">{session?.user?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <span>{session?.user?.email || 'N/A'}</span>
              </div>
              {/* Add phone or other details if available */}
              {/* <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-blue-600" />
                <span>+91-XXXXXXXXXX</span>
              </div> */}
            </div>
          </CardContent>
        </Card>
        <div className="mt-8">
          <Link href="/">
            <Button variant="secondary">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
