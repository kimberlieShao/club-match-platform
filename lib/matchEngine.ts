import { Club, QuizAnswers, MatchResult } from './types';

const MAX_SCORE = 4 * 20 + 15 + 10 + 5; // 110

function clamp(v: number): number {
  return Math.min(5, Math.max(1, v));
}

export function calculateMatch(answers: QuizAnswers, club: Club): { score: number; reason: string; reasonEn: string } {
  const p = club.profile;

  // 1. Interest dimensions (perform/sport/creative/academic) — each max 20 pts
  const dims = ['perform', 'sport', 'creative', 'academic'] as const;
  const dimScores: Record<string, number> = {};
  let total = 0;

  for (const dim of dims) {
    const ansVal = answers[dim] > 0 ? clamp(answers[dim]) : 3;
    const clubVal = p[dim];
    const s = 20 - Math.abs(ansVal - clubVal) * 4;
    dimScores[dim] = s;
    total += s;
  }

  // 2. Time dimension — max 15 pts
  const hoursDiff = (answers.hours || 3) - p.hours;
  const timeScore = hoursDiff >= 0 ? 15 : hoursDiff >= -2 ? 10 : 3;
  total += timeScore;

  // 3. Vibe dimension — max 10 pts
  const vibeScore = answers.vibe && answers.vibe === p.vibe ? 10 : 3;
  total += vibeScore;

  // 4. Role dimension — max 5 pts
  const roleScore = answers.role && p.role.includes(answers.role) ? 5 : 2;
  total += roleScore;

  const score = Math.round((total / MAX_SCORE) * 100);

  // 5. Reason: highest-scoring dimension
  const socialAnswerVal = answers.social > 0 ? clamp(answers.social) : 3;
  const socialScore = 20 - Math.abs(socialAnswerVal - p.social) * 4;

  const topDimEntry = Object.entries(dimScores).sort((a, b) => b[1] - a[1])[0];
  const topDim = topDimEntry[0];
  const topDimScore = topDimEntry[1];

  const clubNameEn = club.nameEn ?? club.name;

  let reason: string;
  let reasonEn: string;

  if (socialScore > topDimScore) {
    reason   = `你热爱社交，${club.name}活跃的氛围很适合你`;
    reasonEn = `You love being social — ${clubNameEn}'s vibrant community is a great fit.`;
  } else {
    const reasonMapZh: Record<string, string> = {
      perform:  `你热爱表达和舞台，${club.name}正需要像你这样的人`,
      creative: `你享受动手创造，${club.name}的氛围和你高度契合`,
      sport:    `你喜欢运动和竞技，${club.name}会让你找到同频的队友`,
      academic: `你追求深度思考，${club.name}是你施展的好地方`,
    };
    const reasonMapEn: Record<string, string> = {
      perform:  `You love performing and the spotlight — ${clubNameEn} needs someone just like you.`,
      creative: `You enjoy making things — ${clubNameEn}'s hands-on culture is exactly your vibe.`,
      sport:    `You thrive on competition — ${clubNameEn} is where you'll find your teammates.`,
      academic: `You love deep thinking — ${clubNameEn} is the perfect place to grow.`,
    };
    reason   = reasonMapZh[topDim];
    reasonEn = reasonMapEn[topDim];
  }

  return { score, reason, reasonEn };
}

export function matchClubs(answers: QuizAnswers, clubs: Club[]): MatchResult[] {
  return clubs
    .map((club) => ({ club, ...calculateMatch(answers, club) }))
    .sort((a, b) => b.score - a.score);
}
