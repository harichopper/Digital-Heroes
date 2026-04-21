import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ContactMessage } from '@/models/ContactMessage';

type SessionUser = { role?: string };

/**
 * GET /api/admin/contact
 * Returns all contact messages (admin only), newest first.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUser | undefined;
  if (!session || sessionUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
  const unread = messages.filter((m) => m.status === 'new').length;

  return NextResponse.json({ messages, unread });
}
