import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import PropertyView from '@/models/PropertyView';
import Inquiry from '@/models/Inquiry';
import Bookmark from '@/models/Bookmark';
import User from '@/models/User';
import Requirement from '@/models/Requirements';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    
    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const daysAgo = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // Calculate previous period for comparison
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (daysAgo * 2));
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - daysAgo);
    
    let stats = {};
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    if (session.user.role === 'owner') {
      // Owner comprehensive stats
      const properties = await Property.find({ ownerId: session.user.id });
      const propertyIds = properties.map(p => p._id.toString());
      
      // Current period stats
      const totalViews = await PropertyView.countDocuments({ 
        propertyId: { $in: propertyIds },
        viewedAt: { $gte: startDate }
      });
      
      const totalInquiries = await Inquiry.countDocuments({ 
        ownerId: session.user.id,
        createdAt: { $gte: startDate }
      });
      
      // Previous period stats for comparison
      const previousViews = await PropertyView.countDocuments({
        propertyId: { $in: propertyIds },
        viewedAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
      });
      
      const previousInquiries = await Inquiry.countDocuments({
        ownerId: session.user.id,
        createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
      });
      
      // Monthly stats
      const monthlyViews = await PropertyView.countDocuments({
        propertyId: { $in: propertyIds },
        viewedAt: { $gte: currentMonth }
      });
      
      const monthlyInquiries = await Inquiry.countDocuments({
        ownerId: session.user.id,
        createdAt: { $gte: currentMonth }
      });
      
      const totalRent = properties.reduce((sum, p) => sum + p.rent, 0);
      const avgRent = properties.length > 0 ? totalRent / properties.length : 0;
      
      // Get property performance with detailed stats
      const propertyPerformance = await PropertyView.aggregate([
        { 
          $match: { 
            propertyId: { $in: propertyIds },
            viewedAt: { $gte: startDate }
          }
        },
        { $group: { _id: '$propertyId', viewCount: { $sum: 1 } } },
        { $sort: { viewCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'properties',
            let: { propId: { $toObjectId: '$_id' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$propId'] } } },
              { $project: { title: 1, rent: 1, bhk: 1 } }
            ],
            as: 'property'
          }
        }
      ]);

      // Add inquiry counts to property performance
      for (const prop of propertyPerformance) {
        const inquiryCount = await Inquiry.countDocuments({
          propertyId: prop._id,
          ownerId: session.user.id,
          createdAt: { $gte: startDate }
        });
        prop.inquiryCount = inquiryCount;
      }

      // Get recent inquiries with more details
      const recentInquiries = await Inquiry.find({ 
        ownerId: session.user.id 
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      // Calculate average response time (mock for now)
      const avgResponseTime = totalInquiries > 0 ? '2.5 hours' : 'N/A';
      
      stats = {
        totalProperties: properties.length,
        activeProperties: properties.filter(p => p.isActive).length,
        verifiedProperties: properties.filter(p => p.isVerified).length,
        totalViews,
        totalInquiries,
        monthlyViews,
        monthlyInquiries,
        totalRent,
        avgRent: Math.round(avgRent),
        avgResponseTime,
        conversionRate: totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : 0,
        propertyPerformance,
        recentInquiries,
        // Trend data (comparing current vs previous period)
        trends: {
          views: {
            current: totalViews,
            previous: previousViews
          },
          inquiries: {
            current: totalInquiries,
            previous: previousInquiries
          }
        }
      };

    } else if (session.user.role === 'admin') {
      // Admin platform-wide stats
      const totalUsers = await User.countDocuments();
      const totalProperties = await Property.countDocuments();
      const totalViews = await PropertyView.countDocuments({
        viewedAt: { $gte: startDate }
      });
      const totalInquiries = await Inquiry.countDocuments({
        createdAt: { $gte: startDate }
      });
      const totalBookmarks = await Bookmark.countDocuments();
      const totalRequirements = await Requirement.countDocuments();
      
      // Previous period for comparison
      const previousViews = await PropertyView.countDocuments({
        viewedAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
      });
      
      const previousInquiries = await Inquiry.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
      });
      
      // Monthly stats
      const monthlyUsers = await User.countDocuments({ createdAt: { $gte: currentMonth } });
      const monthlyProperties = await Property.countDocuments({ createdAt: { $gte: currentMonth } });
      const monthlyViews = await PropertyView.countDocuments({ viewedAt: { $gte: currentMonth } });
      const monthlyInquiries = await Inquiry.countDocuments({ createdAt: { $gte: currentMonth } });

      // User role distribution
      const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      // Top cities by property count
      const topCities = await Property.aggregate([
        { $group: { _id: '$location.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      stats = {
        totalUsers,
        totalProperties,
        totalViews,
        totalInquiries,
        totalBookmarks,
        totalRequirements,
        monthlyUsers,
        monthlyProperties,
        monthlyViews,
        monthlyInquiries,
        activeProperties: await Property.countDocuments({ isActive: true }),
        verifiedProperties: await Property.countDocuments({ isVerified: true }),
        pendingVerifications: await Property.countDocuments({ isVerified: false }),
        usersByRole,
        topCities,
        avgPropertiesPerOwner: totalUsers > 0 ? (totalProperties / totalUsers).toFixed(1) : 0,
        conversionRate: totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : 0,
        trends: {
          views: {
            current: totalViews,
            previous: previousViews
          },
          inquiries: {
            current: totalInquiries,
            previous: previousInquiries
          }
        },
        platformGrowth: {
          usersGrowth: ((monthlyUsers / Math.max(totalUsers - monthlyUsers, 1)) * 100).toFixed(1),
          propertiesGrowth: ((monthlyProperties / Math.max(totalProperties - monthlyProperties, 1)) * 100).toFixed(1)
        }
      };

    } else {
      // Tenant stats
      const bookmarks = await Bookmark.countDocuments({ userId: session.user.id });
      const requirements = await Requirement.countDocuments({ tenantId: session.user.id });
      const inquiries = await Inquiry.countDocuments({ tenantId: session.user.id });
      
      // Recent bookmarks with property details
      const recentBookmarks = await Bookmark.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      const bookmarkedPropertyIds = recentBookmarks.map(b => b.propertyId);
      const recentBookmarkedProperties = await Property.find({ 
        _id: { $in: bookmarkedPropertyIds }
      }).lean();

      // Calculate average rent in the market
      const avgRentResult = await Property.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgRent: { $avg: '$rent' } } }
      ]);

      stats = {
        bookmarkedProperties: bookmarks,
        activeRequirements: requirements,
        totalInquiries: inquiries,
        recentBookmarkedProperties,
        totalProperties: await Property.countDocuments({ isActive: true }),
        newPropertiesThisWeek: await Property.countDocuments({
          isActive: true,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        averageRent: avgRentResult.length > 0 ? Math.round(avgRentResult[0].avgRent) : 0,
        conversionRate: 0 // Not applicable for tenants
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
