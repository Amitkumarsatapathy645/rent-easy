import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminAnalyticsClient from './analytics-client';

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin?callbackUrl=/admin/analytics');
  }

  return <AdminAnalyticsClient session={session} />;
}
