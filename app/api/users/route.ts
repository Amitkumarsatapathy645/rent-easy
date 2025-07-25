import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Property from '@/models/Property';
import Inquiry from '@/models/Inquiry';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all users with additional stats
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Add property count for owners
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        let propertyCount = 0;
        let inquiryCount = 0;

        if (user.role === 'owner') {
          propertyCount = await Property.countDocuments({ ownerId: user._id });
          inquiryCount = await Inquiry.countDocuments({ ownerId: user._id });
        }

        return {
          ...user,
          propertyCount,
          inquiryCount,
          isActive: user.isActive !== false, // Default to true if not set
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
