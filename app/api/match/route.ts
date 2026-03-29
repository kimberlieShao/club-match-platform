import { NextRequest, NextResponse } from 'next/server';
import { mockClubs } from '@/lib/mockData';
import { matchClubs } from '@/lib/matchEngine';
import { QuizAnswers } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const answers: QuizAnswers = await request.json();
    const results = matchClubs(answers, mockClubs);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
