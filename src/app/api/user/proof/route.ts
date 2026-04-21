import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Winner } from '@/models/Winner';

/**
 * POST /api/user/proof
 * Accepts proof screenshot URL for a winner record.
 * Body: JSON { winnerId, proofUrl }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const userId = (session.user as { id?: string }).id;
  const body = await req.json();
  const { winnerId, proofUrl } = body;

  if (!winnerId || !proofUrl) {
    return NextResponse.json({ error: 'winnerId and proofUrl are required' }, { status: 400 });
  }

  const winner = await Winner.findOne({ _id: winnerId, userId });
  if (!winner) return NextResponse.json({ error: 'Winner record not found' }, { status: 404 });
  if (winner.verificationStatus !== 'pending') {
    return NextResponse.json({ error: 'Proof can only be submitted while verification is pending' }, { status: 409 });
  }

  winner.proofUrl = proofUrl;
  await winner.save();

  return NextResponse.json({ winner });
}
