import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const userId = (session.user as { id?: string }).id;
  const { currentPassword, newPassword } = await req.json();

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const valid = await user.comparePassword(currentPassword);
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

  user.password = newPassword;
  await user.save(); // Pre-save hook hashes the new password

  return NextResponse.json({ success: true });
}
