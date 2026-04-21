import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Subscription } from '@/models/Subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { plan } = await req.json() as { plan: 'monthly' | 'yearly' };

  if (!['monthly', 'yearly'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  await connectDB();
  const existing = await Subscription.findOne({ userId, status: 'active' });
  if (existing) return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });

  const priceId = plan === 'yearly'
    ? process.env.STRIPE_YEARLY_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price configuration is missing' }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_id: userId, plan },
    success_url: `${appUrl}/dashboard?subscribed=true`,
    cancel_url: `${appUrl}/auth/signup?cancelled=true`,
    customer_email: session.user.email!,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
