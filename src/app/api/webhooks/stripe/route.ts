import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/mongodb';
import { Subscription } from '@/models/Subscription';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/email';

type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'inactive';
    default:
      return 'inactive';
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await connectDB();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (!userId || !session.subscription) break;

      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = sub.items.data[0]?.price.id;
      const planType = priceId === process.env.STRIPE_YEARLY_PRICE_ID ? 'yearly' : 'monthly';

      await Subscription.findOneAndUpdate(
        { userId },
        {
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          planType,
          status: 'active',
          amount: sub.items.data[0]?.price.unit_amount || 0,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
        { upsert: true, new: true }
      );

      await User.findByIdAndUpdate(userId, { stripeCustomerId: sub.customer as string });

      const user = await User.findById(userId).select('email fullName');
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'Your Digital Heroes subscription is active',
          html: `
            <p>Hi ${user.fullName || 'there'},</p>
            <p>Your ${planType} subscription is now active.</p>
            <p>You can enter your Stableford scores and start participating in monthly draws right away.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard">Open Dashboard</a></p>
          `,
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        {
          status: mapStripeStatus(sub.status),
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        }
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await Subscription.findOneAndUpdate({ stripeSubscriptionId: sub.id }, { status: 'cancelled' });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
