import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Requirement from '@/models/Requirements';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const requirements = await Requirement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(requirements);
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'tenant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    await connectDB();

    const requirement = new Requirement({
      ...data,
      tenantId: session.user.id,
      tenantName: session.user.name,
      tenantEmail: session.user.email,
      tenantPhone: '', // You can get this from user profile
      maxRent: parseInt(data.maxRent),
      bhk: parseInt(data.bhk),
      moveInDate: new Date(data.moveInDate),
      isActive: true,
    });

    await requirement.save();

    return NextResponse.json({ message: 'Requirement posted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating requirement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
