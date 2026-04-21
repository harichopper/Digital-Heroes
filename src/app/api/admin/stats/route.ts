import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Subscription } from '@/models/Subscription';
import { Draw } from '@/models/Draw';
import { Winner } from '@/models/Winner';
import { Charity } from '@/models/Charity';
import { ContactMessage } from '@/models/ContactMessage';

async function adminGuard() {
  const session = await getServerSession(authOptions);
  return session && (session.user as { role?: string })?.role === 'admin' ? session : null;
}

export async function GET() {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const [totalUsers, activeSubscribers, draws, pendingWinners, charities, unreadMessages] = await Promise.all([
    User.countDocuments(),
    Subscription.countDocuments({ status: 'active' }),
    Draw.find().select('totalPool'),
    Winner.countDocuments({ verificationStatus: 'pending' }),
    Charity.find({ isActive: true }).select('totalReceived'),
    ContactMessage.countDocuments({ status: 'new' }),
  ]);

  return NextResponse.json({
    totalUsers,
    activeSubscribers,
    totalPrizePool: draws.reduce((s, d) => s + (d.totalPool || 0), 0),
    charityTotal: charities.reduce((s, c) => s + (c.totalReceived || 0), 0),
    totalDraws: draws.length,
    pendingWinners,
    unreadMessages,
  });
}
