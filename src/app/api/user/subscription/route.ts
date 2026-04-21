import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Subscription } from '@/models/Subscription';
import { User } from '@/models/User';
import '@/models/Charity';
import { Charity } from '@/models/Charity';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

function getSessionUserId(session: unknown): string | null {
  if (!session || typeof session !== 'object' || !('user' in session)) return null;

  const rawUser = (session as { user?: unknown }).user;
  if (!rawUser || typeof rawUser !== 'object') return null;

  const id = (rawUser as { id?: unknown }).id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  await connectDB();

  const [subscription, user] = await Promise.all([
    Subscription.findOne({ userId }).sort({ createdAt: -1 }),
    User.findById(userId).select('-password').populate('selectedCharityId'),
  ]);

  return NextResponse.json({ subscription, user });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  await connectDB();
  const body = (await req.json()) as {
    fullName?: string;
    phone?: string;
    selectedCharityId?: string | null;
    charityPercentage?: number;
    countryCode?: string;
  };

  const update: {
    fullName?: string;
    phone?: string;
    selectedCharityId?: mongoose.Types.ObjectId | null;
    charityPercentage?: number;
    countryCode?: string;
  } = {};

  if (typeof body.fullName === 'string') {
    update.fullName = body.fullName.trim();
  }

  if (typeof body.phone === 'string') {
    update.phone = body.phone.trim();
  }

  if (typeof body.countryCode === 'string') {
    update.countryCode = body.countryCode.trim().toUpperCase().slice(0, 2);
  }

  if (typeof body.charityPercentage === 'number') {
    if (body.charityPercentage < 10 || body.charityPercentage > 100) {
      return NextResponse.json({ error: 'charityPercentage must be between 10 and 100' }, { status: 400 });
    }
    update.charityPercentage = Math.round(body.charityPercentage);
  }

  if (body.selectedCharityId === null || body.selectedCharityId === '') {
    update.selectedCharityId = null;
  } else if (typeof body.selectedCharityId === 'string') {
    if (!mongoose.Types.ObjectId.isValid(body.selectedCharityId)) {
      return NextResponse.json({ error: 'Invalid selectedCharityId' }, { status: 400 });
    }

    const charity = await Charity.findOne({ _id: body.selectedCharityId, isActive: true }).select('_id');
    if (!charity) {
      return NextResponse.json({ error: 'Selected charity not found or inactive' }, { status: 404 });
    }

    update.selectedCharityId = charity._id;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No allowed fields provided for update' }, { status: 400 });
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password').populate('selectedCharityId');
  return NextResponse.json({ user });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  await connectDB();

  const subscription = await Subscription.findOne({ userId, status: { $in: ['active', 'trialing', 'past_due'] } }).sort({ createdAt: -1 });
  if (!subscription || !subscription.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No active Stripe subscription found' }, { status: 404 });
  }

  const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  subscription.cancelAtPeriodEnd = true;
  subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
  await subscription.save();

  return NextResponse.json({
    success: true,
    cancelAtPeriodEnd: true,
    currentPeriodEnd: subscription.currentPeriodEnd,
  });
}
