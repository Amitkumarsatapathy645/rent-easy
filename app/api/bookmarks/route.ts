import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';
import Property from '@/models/Property';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    
    // Get bookmarks with populated property details
    const bookmarks = await Bookmark.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Get all bookmarked properties
    const propertyIds = bookmarks.map(b => b.propertyId);
    const properties = await Property.find({ 
      _id: { $in: propertyIds },
      isActive: true 
    }).lean();

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { propertyId } = await request.json();
    
    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    await connectDB();
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      userId: session.user.id,
      propertyId,
    });

    if (existingBookmark) {
      return NextResponse.json({ error: 'Property already bookmarked' }, { status: 409 });
    }

    // Create new bookmark
    const bookmark = new Bookmark({
      userId: session.user.id,
      propertyId,
    });
    
    await bookmark.save();
    
    return NextResponse.json({ message: 'Bookmark added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { propertyId } = await request.json();
    
    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const deletedBookmark = await Bookmark.findOneAndDelete({
      userId: session.user.id,
      propertyId,
    });

    if (!deletedBookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
