import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import PropertyView from '@/models/PropertyView';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { userAgent, ip } = await request.json();
    
    // Track view
    await PropertyView.create({
      propertyId: params.id,
      userAgent,
      ip,
      viewedAt: new Date(),
    });

    // Increment view count in property
    await Property.findByIdAndUpdate(
      params.id,
      { $inc: { viewCount: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
