import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Winner } from '@/models/Winner';

async function adminGuard() {
  const s = await getServerSession(authOptions);
  return s && (s.user as { role?: string })?.role === 'admin' ? s : null;
}

export async function GET() {
  if (!await adminGuard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectDB();
  const winners = await Winner.find({}).populate('userId', 'email fullName').sort({ createdAt: -1 }).limit(50);
  return NextResponse.json({ winners });
}

export async function PUT(req: NextRequest) {
  if (!await adminGuard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectDB();
  const { id, ...update } = await req.json();
  if (update.paymentStatus === 'paid') update.paidAt = new Date();
  if (update.verificationStatus) update.verifiedAt = new Date();
  const winner = await Winner.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json({ winner });
}
