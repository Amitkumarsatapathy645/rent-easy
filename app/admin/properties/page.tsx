import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminPropertiesClient from './properties-client';

export default async function AdminPropertiesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin?callbackUrl=/admin/properties');
  }

  return <AdminPropertiesClient session={session} />;
}
