import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ContactMessage } from '@/models/ContactMessage';

type SessionUser = { role?: string };

/**
 * PATCH /api/admin/contact/[id]
 * Updates the status of a contact message (admin only).
 * Body: { status: 'new' | 'read' | 'resolved' }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUser | undefined;
  if (!session || sessionUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const { status } = (await req.json()) as { status?: string };

  if (!status || !['new', 'read', 'resolved'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { id } = await params;

  const updated = await ContactMessage.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: updated });
}

/**
 * DELETE /api/admin/contact/[id]
 * Permanently deletes a contact message (admin only).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void req;
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUser | undefined;
  if (!session || sessionUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();
  const deleted = await ContactMessage.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
