import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Winner } from '@/models/Winner';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const winners = await Winner.find({ userId: (session.user as { id?: string }).id }).sort({ createdAt: -1 });
  return NextResponse.json({ winners });
}
