import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    
    const bookmarks = await Bookmark.find({ userId: session.user.id })
      .select('propertyId')
      .lean();

    // Return just the property IDs for checking bookmark status
    const propertyIds = bookmarks.map(b => b.propertyId);
    
    return NextResponse.json(propertyIds);
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
