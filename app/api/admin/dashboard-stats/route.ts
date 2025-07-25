import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Property from '@/models/Property';
import PropertyView from '@/models/PropertyView';
import Inquiry from '@/models/Inquiry';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Calculate current month start
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalViews = await PropertyView.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    
    // Property stats
    const activeProperties = await Property.countDocuments({ isActive: true });
    const verifiedProperties = await Property.countDocuments({ isVerified: true });
    const pendingVerifications = await Property.countDocuments({ isVerified: false, isActive: true });
    
    // Monthly stats
    const monthlyUsers = await User.countDocuments({ 
      createdAt: { $gte: currentMonth } 
    });
    const monthlyProperties = await Property.countDocuments({ 
      createdAt: { $gte: currentMonth } 
    });

    // User distribution by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Top cities by property count
    const topCities = await Property.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent users (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt')
      .lean();

    // Recent properties (last 10)
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title ownerName location.city isVerified createdAt')
      .lean();

    const stats = {
      totalUsers,
      totalProperties,
      totalViews,
      totalInquiries,
      activeProperties,
      verifiedProperties,
      pendingVerifications,
      monthlyUsers,
      monthlyProperties,
      usersByRole,
      topCities,
      recentUsers,
      recentProperties
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
