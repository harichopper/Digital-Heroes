import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Draw } from '@/models/Draw';

export async function GET() {
  await connectDB();
  const draws = await Draw.find({ status: 'published' }).sort({ drawDate: -1 }).limit(12);
  return NextResponse.json({ draws });
}
