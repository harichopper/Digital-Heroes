import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Score } from '@/models/Score';
import { Subscription } from '@/models/Subscription';

const MAX_SCORES = 5;
function getUserIdFromSession(session: unknown) {
  if (!session || typeof session !== 'object' || !('user' in session)) return null;

  const rawUser = (session as { user?: unknown }).user;
  if (!rawUser || typeof rawUser !== 'object') return null;

  const sessionUser = rawUser as { id?: unknown };
  return typeof sessionUser.id === 'string' ? sessionUser.id : null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getUserIdFromSession(session);
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const scores = await Score.find({ userId })
    .sort({ playedDate: -1 })
    .limit(MAX_SCORES);

  return NextResponse.json({ scores });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserIdFromSession(session);
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();

  // Validate subscription
  const sub = await Subscription.findOne({ userId, status: 'active' });
  if (!sub) {
    return NextResponse.json({ error: 'An active subscription is required to enter scores' }, { status: 403 });
  }

  const body = await req.json();
  const { score, playedDate } = body;

  const num = Number(score);
  if (!Number.isInteger(num) || num < 1 || num > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45 (Stableford format)' }, { status: 400 });
  }

  if (new Date(playedDate) > new Date()) {
    return NextResponse.json({ error: 'Cannot enter scores for future dates' }, { status: 400 });
  }

  // Duplicate date check
  const dup = await Score.findOne({ userId, playedDate });
  if (dup) {
    return NextResponse.json({ error: 'A score already exists for this date. Edit or delete it first.' }, { status: 409 });
  }

  // Rolling limit: drop oldest if at 5
  const existing = await Score.find({ userId }).sort({ playedDate: 1 });
  if (existing.length >= MAX_SCORES) {
    await Score.findByIdAndDelete(existing[0]._id);
  }

  const created = await Score.create({ userId, score: num, playedDate });
  return NextResponse.json({ score: created }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserIdFromSession(session);
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { id, score, playedDate } = body;

  const existing = await Score.findOne({ _id: id, userId });
  if (!existing) return NextResponse.json({ error: 'Score not found' }, { status: 404 });

  const num = Number(score);
  if (!Number.isInteger(num) || num < 1 || num > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
  }

  // Check duplicate only if date is changing
  if (playedDate !== existing.playedDate) {
    const dup = await Score.findOne({ userId, playedDate, _id: { $ne: id } });
    if (dup) return NextResponse.json({ error: 'A score already exists for this date' }, { status: 409 });
  }

  existing.score = num;
  existing.playedDate = playedDate;
  await existing.save();

  return NextResponse.json({ score: existing });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserIdFromSession(session);
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const existing = await Score.findOne({ _id: id, userId });
  if (!existing) return NextResponse.json({ error: 'Score not found' }, { status: 404 });

  await Score.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
