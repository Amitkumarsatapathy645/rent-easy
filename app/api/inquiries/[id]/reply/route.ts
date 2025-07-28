import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectDB();

    const inquiry = await Inquiry.findById(params.id);
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Check if user has permission to reply to this inquiry
    if (inquiry.ownerId !== session.user.id && inquiry.tenantId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const reply = {
      senderId: session.user.id,
      senderName: session.user.name,
      senderRole: session.user.role,
      message: message.trim(),
      timestamp: new Date()
    };

    // Add reply to inquiry
    await Inquiry.findByIdAndUpdate(params.id, {
      $push: { replies: reply },
      $set: { 
        status: 'replied',
        isRead: false // Mark as unread for the other party
      }
    });

    return NextResponse.json({ 
      message: 'Reply sent successfully',
      reply 
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
