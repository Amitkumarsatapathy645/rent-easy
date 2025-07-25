import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import UserManagementClient from './users-client';

export default async function UserManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin?callbackUrl=/admin/users');
  }

  return <UserManagementClient session={session} />;
}
