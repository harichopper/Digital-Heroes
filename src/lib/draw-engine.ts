/**
 * Draw Engine — Handles the core draw logic for the Digital Heroes platform.
 *
 * Supports two modes:
 *   1. Random — Standard lottery-style: 5 numbers generated uniformly at random
 *   2. Algorithmic — Weighted by most/least frequent user scores across all participants
 *
 * The engine also handles match counting and prize distribution calculations.
 */

const PRIZE_DISTRIBUTION = { fiveMatch: 0.4, fourMatch: 0.35, threeMatch: 0.25 };

/** Generate 5 random winning numbers between MIN_SCORE and MAX_SCORE */
export function generateRandomDraw(min = 1, max = 45): number[] {
  const numbers: Set<number> = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate weighted winning numbers based on score frequency analysis.
 *
 * Strategy: Numbers that appear LESS frequently among users have a HIGHER
 * chance of being drawn (rewarding unique scores). This creates a more
 * interesting game dynamic than pure randomness.
 */
export function generateAlgorithmicDraw(
  allUserScores: number[][],
  min = 1,
  max = 45
): number[] {
  // Build frequency map from all user scores
  const frequency: Map<number, number> = new Map();
  for (let i = min; i <= max; i++) {
    frequency.set(i, 0);
  }

  allUserScores.forEach((scores) => {
    scores.forEach((score) => {
      frequency.set(score, (frequency.get(score) || 0) + 1);
    });
  });

  // Invert frequencies to create weights (less frequent = higher weight)
  const maxFreq = Math.max(...Array.from(frequency.values()), 1);
  const weights: { number: number; weight: number }[] = [];

  frequency.forEach((freq, num) => {
    weights.push({ number: num, weight: maxFreq - freq + 1 });
  });

  // Weighted random selection without replacement
  const selected: number[] = [];
  const remaining = [...weights];

  for (let i = 0; i < 5; i++) {
    const totalWeight = remaining.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (let j = 0; j < remaining.length; j++) {
      random -= remaining[j].weight;
      if (random <= 0) {
        selected.push(remaining[j].number);
        remaining.splice(j, 1);
        break;
      }
    }
  }

  return selected.sort((a, b) => a - b);
}

/**
 * Count how many numbers from `userScores` match the `winningNumbers`.
 * Both arrays are sorted arrays of 5 numbers.
 */
export function countMatches(userScores: number[], winningNumbers: number[]): number {
  const winSet = new Set(winningNumbers);
  return userScores.filter((score) => winSet.has(score)).length;
}

/**
 * Determine winners from all draw entries.
 * Returns entries grouped by match count (5, 4, 3).
 */
export function determineWinners(
  entries: { userId: string; scores: number[] }[],
  winningNumbers: number[]
): {
  fiveMatch: { userId: string; scores: number[]; matchCount: number }[];
  fourMatch: { userId: string; scores: number[]; matchCount: number }[];
  threeMatch: { userId: string; scores: number[]; matchCount: number }[];
} {
  const results = {
    fiveMatch: [] as { userId: string; scores: number[]; matchCount: number }[],
    fourMatch: [] as { userId: string; scores: number[]; matchCount: number }[],
    threeMatch: [] as { userId: string; scores: number[]; matchCount: number }[],
  };

  entries.forEach((entry) => {
    const matchCount = countMatches(entry.scores, winningNumbers);
    const result = { userId: entry.userId, scores: entry.scores, matchCount };

    if (matchCount >= 5) results.fiveMatch.push(result);
    else if (matchCount === 4) results.fourMatch.push(result);
    else if (matchCount === 3) results.threeMatch.push(result);
  });

  return results;
}

/**
 * Calculate prize amounts for each tier.
 *
 * @param totalPool - Total prize pool in cents
 * @param jackpotRollover - Accumulated rollover from previous unclaimed jackpots
 * @param winners - Winner counts per tier
 * @returns Prize amounts per winner in each tier
 */
export function calculatePrizes(
  totalPool: number,
  jackpotRollover: number,
  winners: { fiveMatchCount: number; fourMatchCount: number; threeMatchCount: number }
): {
  fiveMatchPrize: number;
  fourMatchPrize: number;
  threeMatchPrize: number;
  newJackpotRollover: number;
} {
  const jackpotPool = Math.floor(totalPool * PRIZE_DISTRIBUTION.fiveMatch) + jackpotRollover;
  const fourMatchPool = Math.floor(totalPool * PRIZE_DISTRIBUTION.fourMatch);
  const threeMatchPool = Math.floor(totalPool * PRIZE_DISTRIBUTION.threeMatch);

  // If no 5-match winner, jackpot rolls over
  const hasJackpotWinner = winners.fiveMatchCount > 0;

  return {
    fiveMatchPrize: hasJackpotWinner
      ? Math.floor(jackpotPool / winners.fiveMatchCount)
      : 0,
    fourMatchPrize: winners.fourMatchCount > 0
      ? Math.floor(fourMatchPool / winners.fourMatchCount)
      : 0,
    threeMatchPrize: winners.threeMatchCount > 0
      ? Math.floor(threeMatchPool / winners.threeMatchCount)
      : 0,
    newJackpotRollover: hasJackpotWinner ? 0 : jackpotPool,
  };
}

/**
 * Run a full draw simulation without persisting results.
 * Used by admins to preview outcomes before publishing.
 */
export function simulateDraw(
  entries: { userId: string; scores: number[] }[],
  drawType: 'random' | 'algorithmic',
  totalPool: number,
  jackpotRollover: number
) {
  const allScores = entries.map((e) => e.scores);
  const winningNumbers =
    drawType === 'random'
      ? generateRandomDraw()
      : generateAlgorithmicDraw(allScores);

  const winners = determineWinners(entries, winningNumbers);

  const prizes = calculatePrizes(totalPool, jackpotRollover, {
    fiveMatchCount: winners.fiveMatch.length,
    fourMatchCount: winners.fourMatch.length,
    threeMatchCount: winners.threeMatch.length,
  });

  return {
    winningNumbers,
    winners,
    prizes,
    summary: {
      totalEntries: entries.length,
      fiveMatchCount: winners.fiveMatch.length,
      fourMatchCount: winners.fourMatch.length,
      threeMatchCount: winners.threeMatch.length,
      totalPayout:
        prizes.fiveMatchPrize * winners.fiveMatch.length +
        prizes.fourMatchPrize * winners.fourMatch.length +
        prizes.threeMatchPrize * winners.threeMatch.length,
      jackpotRollover: prizes.newJackpotRollover,
    },
  };
}

