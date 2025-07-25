import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Property from '@/models/Property';
import Inquiry from '@/models/Inquiry';
import Bookmark from '@/models/Bookmark';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(params.id).select('-password').lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get additional user stats
    const propertyCount = user.role === 'owner' 
      ? await Property.countDocuments({ ownerId: params.id })
      : 0;
    
    const inquiryCount = await Inquiry.countDocuments({ 
      [user.role === 'owner' ? 'ownerId' : 'tenantId']: params.id 
    });
    
    const bookmarkCount = user.role === 'tenant' 
      ? await Bookmark.countDocuments({ userId: params.id })
      : 0;

    return NextResponse.json({
      ...user,
      propertyCount,
      inquiryCount,
      bookmarkCount
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData.isActive = true;
        message = `User ${user.name} has been activated`;
        break;
      
      case 'deactivate':
        if (params.id === session.user.id) {
          return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 });
        }
        updateData.isActive = false;
        message = `User ${user.name} has been deactivated`;
        break;
      
      case 'promote':
        if (user.role === 'admin') {
          return NextResponse.json({ error: 'User is already an admin' }, { status: 400 });
        }
        updateData.role = 'admin';
        message = `User ${user.name} has been promoted to admin`;
        break;
      
      case 'demote':
        if (user.role !== 'admin') {
          return NextResponse.json({ error: 'User is not an admin' }, { status: 400 });
        }
        if (params.id === session.user.id) {
          return NextResponse.json({ error: 'Cannot demote your own account' }, { status: 400 });
        }
        updateData.role = 'owner'; // Default demote to owner
        message = `User ${user.name} has been demoted from admin`;
        break;
      
      case 'delete':
        if (params.id === session.user.id) {
          return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }
        
        // Delete related data
        await Property.deleteMany({ ownerId: params.id });
        await Inquiry.deleteMany({ 
          $or: [{ ownerId: params.id }, { tenantId: params.id }] 
        });
        await Bookmark.deleteMany({ userId: params.id });
        
        // Delete user
        await User.findByIdAndDelete(params.id);
        
        return NextResponse.json({ 
          message: `User ${user.name} and all related data have been deleted` 
        });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(params.id, updateData);
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
