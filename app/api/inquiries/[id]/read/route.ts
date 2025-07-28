import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const inquiry = await Inquiry.findById(params.id);
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Check if user has permission to mark this inquiry as read
    if (inquiry.ownerId !== session.user.id && inquiry.tenantId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark as read
    await Inquiry.findByIdAndUpdate(params.id, {
      isRead: true,
      readAt: new Date()
    });

    return NextResponse.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
