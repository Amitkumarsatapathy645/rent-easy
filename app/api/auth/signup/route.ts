import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, role } = await request.json();

    // Basic Validation
    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    if (!['tenant', 'owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Invalid email format or email too long' }, { status: 400 });
    }

    // Phone number validation (10-digit Indian number)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number. Must be a 10-digit Indian number starting with 6-9' }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();
    

    // Check for existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json({ error: 'User with this phone number already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save user
    const user = new User({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role,
    });

    await user.save();

    // Set redirect URL based on role
    let redirectUrl = '/';
    if (role === 'owner') {
      redirectUrl = '/dashboard/owner';
    } else if (role === 'admin') {
      redirectUrl = '/admin';
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        redirectUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error instanceof Error ? error.stack : error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
