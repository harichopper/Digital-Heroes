import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Score } from '@/models/Score';
import { Subscription } from '@/models/Subscription';

const MAX_SCORES = 5;

async function adminGuard() {
  const session = await getServerSession(authOptions);
  return session && (session.user as { role?: string })?.role === 'admin' ? session : null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });

  await connectDB();
  const [user, scores, subscription] = await Promise.all([
    User.findById(id).select('-password'),
    Score.find({ userId: id }).sort({ playedDate: -1 }),
    Subscription.findOne({ userId: id }).sort({ createdAt: -1 }),
  ]);

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ user, scores, subscription });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });

  await connectDB();
  const body = await req.json();
  const action = body?.action as 'upsertScore' | 'deleteScore' | 'updateSubscription' | undefined;
  if (!action) return NextResponse.json({ error: 'action is required' }, { status: 400 });

  if (action === 'upsertScore') {
    const scoreValue = Number(body.score);
    const playedDate = String(body.playedDate || '');
    const scoreId = typeof body.scoreId === 'string' ? body.scoreId : '';

    if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 45) {
      return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
    }
    if (!playedDate) return NextResponse.json({ error: 'playedDate is required' }, { status: 400 });

    if (scoreId) {
      const existing = await Score.findOne({ _id: scoreId, userId: id });
      if (!existing) return NextResponse.json({ error: 'Score not found' }, { status: 404 });
      const duplicate = await Score.findOne({ userId: id, playedDate, _id: { $ne: scoreId } });
      if (duplicate) return NextResponse.json({ error: 'A score already exists for this date' }, { status: 409 });
      existing.score = scoreValue;
      existing.playedDate = playedDate;
      await existing.save();
      return NextResponse.json({ score: existing });
    }

    const duplicate = await Score.findOne({ userId: id, playedDate });
    if (duplicate) return NextResponse.json({ error: 'A score already exists for this date' }, { status: 409 });

    const existingScores = await Score.find({ userId: id }).sort({ playedDate: 1 });
    if (existingScores.length >= MAX_SCORES) {
      await Score.findByIdAndDelete(existingScores[0]._id);
    }

    const created = await Score.create({ userId: id, score: scoreValue, playedDate });
    return NextResponse.json({ score: created }, { status: 201 });
  }

  if (action === 'deleteScore') {
    const scoreId = String(body.scoreId || '');
    const existing = await Score.findOne({ _id: scoreId, userId: id });
    if (!existing) return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    await Score.findByIdAndDelete(scoreId);
    return NextResponse.json({ success: true });
  }

  if (action === 'updateSubscription') {
    const update: {
      status?: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
      planType?: 'monthly' | 'yearly';
      cancelAtPeriodEnd?: boolean;
    } = {};

    if (['active', 'inactive', 'cancelled', 'past_due', 'trialing'].includes(body.status)) {
      update.status = body.status;
    }
    if (['monthly', 'yearly'].includes(body.planType)) {
      update.planType = body.planType;
    }
    if (typeof body.cancelAtPeriodEnd === 'boolean') {
      update.cancelAtPeriodEnd = body.cancelAtPeriodEnd;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid subscription fields provided' }, { status: 400 });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId: id },
      update,
      { new: true }
    );
    if (!subscription) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    return NextResponse.json({ subscription });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
