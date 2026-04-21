import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Subscription } from '@/models/Subscription';

/**
 * POST /api/auth/register
 * Creates a new user account and an inactive subscription record for the selected plan.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, fullName, plan, selectedCharityId } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Create user (password hashed by pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      fullName,
      role: 'user',
      ...(selectedCharityId ? { selectedCharityId } : {}),
    });

    // Create inactive subscription record
    await Subscription.create({
      userId: user._id,
      planType: plan || 'monthly',
      status: 'inactive',
      amount: plan === 'yearly' ? 9990 : 999,
    });

    return NextResponse.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.fullName },
    }, { status: 201 });

  } catch (err: unknown) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
