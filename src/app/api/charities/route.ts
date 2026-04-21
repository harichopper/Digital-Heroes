import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Charity } from '@/models/Charity';

/** GET /api/charities — Public charity listing */
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get('featured');

  const query: Record<string, unknown> = { isActive: true };
  if (featured === 'true') query.isFeatured = true;

  const charities = await Charity.find(query).sort({ isFeatured: -1, name: 1 });
  return NextResponse.json({ charities });
}
