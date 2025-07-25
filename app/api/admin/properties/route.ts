import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
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

    // Get all properties with additional stats
    const properties = await Property.find()
      .sort({ createdAt: -1 })
      .lean() as Array<{ _id: string; [key: string]: any }>;

    // Get view counts for properties
    const propertyIds = properties.map(p => p._id.toString());
    
    const viewCounts = await PropertyView.aggregate([
      { $match: { propertyId: { $in: propertyIds } } },
      { $group: { _id: '$propertyId', count: { $sum: 1 } } }
    ]);

    const inquiryCounts = await Inquiry.aggregate([
      { $match: { propertyId: { $in: propertyIds } } },
      { $group: { _id: '$propertyId', count: { $sum: 1 } } }
    ]);

    // Map counts to properties
    const propertiesWithStats = properties.map(property => {
      const viewCount = viewCounts.find(v => v._id === property._id.toString())?.count || 0;
      const inquiryCount = inquiryCounts.find(i => i._id === property._id.toString())?.count || 0 ;
      
      return {
        ...property,
        viewCount,
        inquiryCount
      };
    });

    return NextResponse.json({ properties: propertiesWithStats });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
