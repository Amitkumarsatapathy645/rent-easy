import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import Property from '@/models/Property';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = session.user.role;

    await connectDB();

    let query: any = {};

    // Filter based on user role
    if (role === 'tenant') {
      query.tenantId = session.user.id;
    } else if (role === 'owner') {
      query.ownerId = session.user.id;
    } else if (role === 'admin') {
      // Admin can see all inquiries
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'tenant') {
      return NextResponse.json({ error: 'Only tenants can send inquiries' }, { status: 401 });
    }

    const { propertyId, message, phone, moveInDate, budget } = await request.json();

    if (!propertyId || !message || !phone) {
      return NextResponse.json({ error: 'Property ID, message, and phone are required' }, { status: 400 });
    }

    await connectDB();

    // Get property details
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if user already sent an inquiry for this property
    const existingInquiry = await Inquiry.findOne({
      propertyId,
      tenantId: session.user.id,
      status: { $in: ['pending', 'replied'] }
    });

    if (existingInquiry) {
      return NextResponse.json({ error: 'You have already sent an inquiry for this property' }, { status: 400 });
    }

    // Get tenant details
    const tenant = await User.findById(session.user.id);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Create inquiry
    const inquiry = new Inquiry({
      propertyId,
      propertyTitle: property.title,
      tenantId: session.user.id,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      tenantPhone: phone,
      ownerId: property.ownerId,
      ownerName: property.ownerName,
      ownerEmail: property.ownerEmail,
      message,
      moveInDate: moveInDate ? new Date(moveInDate) : undefined,
      budget: budget || undefined,
      status: 'pending',
      isRead: false
    });

    await inquiry.save();

    return NextResponse.json({ 
      message: 'Inquiry sent successfully',
      inquiry: {
        id: inquiry._id,
        status: inquiry.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
