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

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    await connectDB();

    // Overview stats
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalViews = await PropertyView.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;

    // Growth calculations (comparing current period with previous period)
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (period * 2));
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - period);

    const currentPeriodUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const previousPeriodUsers = await User.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd } 
    });

    const currentPeriodProperties = await Property.countDocuments({ createdAt: { $gte: startDate } });
    const previousPeriodProperties = await Property.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd } 
    });

    const currentPeriodViews = await PropertyView.countDocuments({ viewedAt: { $gte: startDate } });
    const previousPeriodViews = await PropertyView.countDocuments({ 
      viewedAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd } 
    });

    const currentPeriodInquiries = await Inquiry.countDocuments({ createdAt: { $gte: startDate } });
    const previousPeriodInquiries = await Inquiry.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd } 
    });

    // Calculate growth percentages
    const userGrowth = previousPeriodUsers > 0 ? 
      ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100 : 0;
    const propertyGrowth = previousPeriodProperties > 0 ? 
      ((currentPeriodProperties - previousPeriodProperties) / previousPeriodProperties) * 100 : 0;
    const viewGrowth = previousPeriodViews > 0 ? 
      ((currentPeriodViews - previousPeriodViews) / previousPeriodViews) * 100 : 0;
    const inquiryGrowth = previousPeriodInquiries > 0 ? 
      ((currentPeriodInquiries - previousPeriodInquiries) / previousPeriodInquiries) * 100 : 0;

    // Top cities
    const topCities = await Property.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topCitiesWithPercentage = topCities.map(city => ({
      ...city,
      percentage: totalProperties > 0 ? (city.count / totalProperties) * 100 : 0
    }));

    // Property types distribution
    const propertyTypes = await Property.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const propertyTypesWithPercentage = propertyTypes.map(type => ({
      ...type,
      percentage: totalProperties > 0 ? (type.count / totalProperties) * 100 : 0
    }));

    // Recent activity (simplified)
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentProperties = await Property.find().sort({ createdAt: -1 }).limit(5).lean();
    
    const recentActivity = [
      ...recentUsers.map(user => ({
        type: 'user_signup' as const,
        description: `New user ${user.name} signed up as ${user.role}`,
        timestamp: user.createdAt
      })),
      ...recentProperties.map(property => ({
        type: 'property_listed' as const,
        description: `New property "${property.title}" listed in ${property.location.city}`,
        timestamp: property.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const analytics = {
      overview: {
        totalUsers,
        totalProperties,
        totalViews,
        totalInquiries,
        conversionRate
      },
      growth: {
        userGrowth: parseFloat(userGrowth.toFixed(1)),
        propertyGrowth: parseFloat(propertyGrowth.toFixed(1)),
        viewGrowth: parseFloat(viewGrowth.toFixed(1)),
        inquiryGrowth: parseFloat(inquiryGrowth.toFixed(1))
      },
      topCities: topCitiesWithPercentage,
      propertyTypes: propertyTypesWithPercentage,
      recentActivity
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
