import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

async function adminGuard() {
  const s = await getServerSession(authOptions);
  return s && (s.user as { role?: string })?.role === 'admin' ? s : null;
}

export async function GET() {
  if (!await adminGuard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectDB();
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  return NextResponse.json({ users });
}

export async function PUT(req: NextRequest) {
  if (!await adminGuard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectDB();
  const { id, role } = await req.json();
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
  return NextResponse.json({ user });
}
