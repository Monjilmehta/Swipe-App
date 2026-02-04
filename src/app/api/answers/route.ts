import { NextRequest, NextResponse } from 'next/server';
import { setAnswer, removeAnswer, getSessionAnswers } from '@/lib/mock-data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
  }

  try {
    const answers = getSessionAnswers(sessionId);
    return NextResponse.json({ success: true, answers });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch answers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { sessionId?: string; scenarioId?: string; answer?: 'yes' | 'no' };
    const { sessionId, scenarioId, answer } = body;

    if (!sessionId || !scenarioId || !answer) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    setAnswer(sessionId, scenarioId, answer);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving answer:', error);
    return NextResponse.json({ success: false, error: 'Failed to save answer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const scenarioId = searchParams.get('scenarioId');

  if (!sessionId || !scenarioId) {
    return NextResponse.json({ success: false, error: 'Session ID and Scenario ID required' }, { status: 400 });
  }

  try {
    removeAnswer(sessionId, scenarioId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing answer:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove answer' }, { status: 500 });
  }
}
