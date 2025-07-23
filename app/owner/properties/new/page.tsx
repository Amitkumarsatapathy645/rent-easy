import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientNewPropertyPage from './client-page';

export default async function NewPropertyPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'owner') {
    redirect('/auth/signin?callbackUrl=/properties/new');
  }

  return <ClientNewPropertyPage />;
}
