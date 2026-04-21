import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Charity } from '@/models/Charity';

/** Admin-only charity CRUD */
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as { role?: string })?.role === 'admin' ? session : null;
}

export async function POST(req: NextRequest) {
  const session = await isAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const charity = await Charity.create(body);
  return NextResponse.json({ charity }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await isAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const { id, ...update } = body;
  const charity = await Charity.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json({ charity });
}

export async function DELETE(req: NextRequest) {
  const session = await isAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await Charity.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
