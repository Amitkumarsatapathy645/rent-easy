import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EditPropertyClient from './edit-client';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';

interface Props {
  params: { id: string };
}

export default async function EditPropertyPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'owner') {
    redirect('/auth/signin?callbackUrl=/proproperties/new');
  }

  try {
    await connectDB();
    const property = await Property.findById(params.id);

    if (!property) {
      redirect('/dashboard/owner/properties');
    }

    // Check if user owns this property
    if (property.ownerId !== session.user.id) {
      redirect('/dashboard/owner/properties');
    }

    return <EditPropertyClient property={JSON.parse(JSON.stringify(property))} />;
  } catch (error) {
    console.error('Error fetching property:', error);
    redirect('/dashboard/owner/properties');
  }
}
