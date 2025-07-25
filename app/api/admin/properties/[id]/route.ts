import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();
    
    await connectDB();

    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    let updates: any = {};
    let message = '';

    switch (action) {
      case 'verify':
        updates = { isVerified: true };
        message = 'Property verified successfully';
        break;
      case 'reject':
        updates = { isVerified: false, isActive: false };
        message = 'Property rejected and deactivated';
        break;
      case 'activate':
        updates = { isActive: true };
        message = 'Property activated successfully';
        break;
      case 'deactivate':
        updates = { isActive: false };
        message = 'Property deactivated successfully';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await Property.findByIdAndUpdate(params.id, updates);

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
