import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Draw } from '@/models/Draw';
import { Subscription } from '@/models/Subscription';
import { Score } from '@/models/Score';
import { DrawEntry } from '@/models/DrawEntry';
import { Winner } from '@/models/Winner';
import { User } from '@/models/User';
import { countMatches, simulateDraw } from '@/lib/draw-engine';
import { sendEmail } from '@/lib/email';

type SessionUser = { id?: string; role?: string };

type EligibleEntry = {
  userId: string;
  scores: number[];
};

type SimulatedEntry = {
  userId: string;
  scores: number[];
  matchCount: number;
};

type DrawSimulationData = {
  entries: SimulatedEntry[];
  prizes: {
    fiveMatchPrize: number;
    fourMatchPrize: number;
    threeMatchPrize: number;
    newJackpotRollover: number;
  };
  summary: {
    totalEntries: number;
    fiveMatchCount: number;
    fourMatchCount: number;
    threeMatchCount: number;
    totalPayout: number;
    jackpotRollover: number;
  };
};

function getSessionUser(session: unknown): SessionUser {
  if (!session || typeof session !== 'object' || !('user' in session)) return {};

  const rawUser = (session as { user?: unknown }).user;
  if (!rawUser || typeof rawUser !== 'object') return {};

  const typedUser = rawUser as { id?: unknown; role?: unknown };
  return {
    id: typeof typedUser.id === 'string' ? typedUser.id : undefined,
    role: typeof typedUser.role === 'string' ? typedUser.role : undefined,
  };
}

function poolContributionPence(planType: 'monthly' | 'yearly', amount: number): number {
  if (planType === 'yearly') {
    const yearlyAmount = amount > 0 ? amount : 9990;
    return Math.floor((yearlyAmount / 12) * 0.5);
  }

  const monthlyAmount = amount > 0 ? amount : 999;
  return Math.floor(monthlyAmount * 0.5);
}

async function getEligibleEntriesAndPool(): Promise<{ entries: EligibleEntry[]; totalPool: number }> {
  const activeSubs = await Subscription.find({ status: 'active' }).select('userId planType amount');

  const entries: EligibleEntry[] = [];
  let totalPool = 0;

  for (const sub of activeSubs) {
    const recentScores = await Score.find({ userId: sub.userId })
      .sort({ playedDate: -1 })
      .limit(5)
      .select('score');

    if (recentScores.length < 5) continue;

    entries.push({
      userId: String(sub.userId),
      scores: recentScores.map((scoreDoc) => scoreDoc.score),
    });

    totalPool += poolContributionPence(sub.planType, sub.amount);
  }

  return { entries, totalPool };
}

async function adminGuard() {
  const s = await getServerSession(authOptions);
  const sessionUser = getSessionUser(s);
  return s && sessionUser.role === 'admin' ? s : null;
}

export async function GET() {
  if (!await adminGuard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectDB();
  const draws = await Draw.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ draws });
}

export async function POST() {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectDB();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const existing = await Draw.findOne({ month, year });
  if (existing) return NextResponse.json({ error: 'A draw for this month already exists' }, { status: 409 });

  const previousPublished = await Draw.findOne({ status: 'published' }).sort({ createdAt: -1 }).select('jackpotRollover');
  const carryRollover = previousPublished?.jackpotRollover || 0;
  const sessionUser = getSessionUser(session);

  const draw = await Draw.create({
    drawDate: now.toISOString().split('T')[0],
    month,
    year,
    drawType: 'random',
    status: 'pending',
    jackpotRollover: carryRollover,
    createdBy: sessionUser.id,
  });

  return NextResponse.json({ draw }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectDB();

  const { id, action } = (await req.json()) as { id?: string; action?: 'simulate' | 'publish' };
  if (!id || !action) return NextResponse.json({ error: 'id and action are required' }, { status: 400 });

  const draw = await Draw.findById(id);
  if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 });

  if (action === 'simulate') {
    const { entries, totalPool } = await getEligibleEntriesAndPool();
    if (entries.length === 0) {
      return NextResponse.json({ error: 'No eligible participants with 5 scores and active subscription' }, { status: 409 });
    }

    const simulation = simulateDraw(entries, draw.drawType, totalPool, draw.jackpotRollover || 0);
    const simulatedEntries: SimulatedEntry[] = entries.map((entry) => ({
      userId: entry.userId,
      scores: entry.scores,
      matchCount: countMatches(entry.scores, simulation.winningNumbers),
    }));

    const jackpotPool = Math.floor(totalPool * 0.4) + (draw.jackpotRollover || 0);
    const fourMatchPool = Math.floor(totalPool * 0.35);
    const threeMatchPool = Math.floor(totalPool * 0.25);

    const simulationData: DrawSimulationData = {
      entries: simulatedEntries,
      prizes: simulation.prizes,
      summary: simulation.summary,
    };

    draw.totalParticipants = entries.length;
    draw.totalPool = totalPool;
    draw.jackpotPool = jackpotPool;
    draw.fourMatchPool = fourMatchPool;
    draw.threeMatchPool = threeMatchPool;
    draw.winningNumbers = simulation.winningNumbers;
    draw.simulationData = simulationData;
    draw.status = 'simulated';
    await draw.save();
    return NextResponse.json({ draw, summary: simulation.summary, prizes: simulation.prizes });
  }

  if (action === 'publish') {
    if (draw.status === 'published') {
      return NextResponse.json({ error: 'Draw already published' }, { status: 409 });
    }

    if (draw.status !== 'simulated' || !draw.simulationData) {
      return NextResponse.json({ error: 'Draw must be simulated before publishing' }, { status: 409 });
    }

    const simulationData = draw.simulationData as DrawSimulationData;
    if (!simulationData.entries?.length) {
      return NextResponse.json({ error: 'Simulation data is missing eligible entries' }, { status: 409 });
    }

    await DrawEntry.deleteMany({ drawId: draw._id });
    await Winner.deleteMany({ drawId: draw._id });

    const createdEntries = await DrawEntry.insertMany(
      simulationData.entries.map((entry) => ({
        drawId: draw._id,
        userId: entry.userId,
        scores: entry.scores,
        matchCount: entry.matchCount,
        isWinner: entry.matchCount >= 3,
      }))
    );

    const entryByUserId = new Map<string, string>(
      createdEntries.map((entryDoc) => [String(entryDoc.userId), String(entryDoc._id)])
    );

    const winnerDocs = simulationData.entries
      .filter((entry) => entry.matchCount >= 3)
      .map((entry) => {
        const prizeAmount =
          entry.matchCount >= 5
            ? simulationData.prizes.fiveMatchPrize
            : entry.matchCount === 4
              ? simulationData.prizes.fourMatchPrize
              : simulationData.prizes.threeMatchPrize;

        return {
          drawId: draw._id,
          userId: entry.userId,
          drawEntryId: entryByUserId.get(entry.userId),
          matchCount: entry.matchCount,
          prizeAmount,
          verificationStatus: 'pending' as const,
          paymentStatus: 'pending' as const,
        };
      });

    if (winnerDocs.length > 0) {
      await Winner.insertMany(winnerDocs);

      const winnerUserIds = winnerDocs.map((winnerDoc) => winnerDoc.userId);
      const winnerUsers = await User.find({ _id: { $in: winnerUserIds } }).select('email fullName');
      const winnerById = new Map<string, { email: string; fullName: string }>(
        winnerUsers
          .filter((userDoc) => typeof userDoc.email === 'string')
          .map((userDoc) => [String(userDoc._id), { email: userDoc.email, fullName: userDoc.fullName || 'Golfer' }])
      );

      await Promise.allSettled(
        winnerDocs.map((winnerDoc) => {
          const user = winnerById.get(String(winnerDoc.userId));
          if (!user) return Promise.resolve({ sent: false, skipped: true });

          const amountGBP = (winnerDoc.prizeAmount / 100).toFixed(2);
          return sendEmail({
            to: user.email,
            subject: 'You won a Digital Heroes prize draw',
            html: `
              <p>Hi ${user.fullName},</p>
              <p>Great news — you matched <strong>${winnerDoc.matchCount}</strong> numbers in this month’s draw and won <strong>£${amountGBP}</strong>.</p>
              <p>Please upload proof in your dashboard so our admin team can verify and release payment.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/winnings">Open My Winnings</a></p>
            `,
          });
        })
      );
    }

    draw.jackpotRollover = simulationData.prizes.newJackpotRollover;
    draw.status = 'published';
    draw.publishedAt = new Date();
    await draw.save();
    return NextResponse.json({ draw, winnersCreated: winnerDocs.length });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
