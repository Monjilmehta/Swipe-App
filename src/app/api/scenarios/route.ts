import { NextResponse } from 'next/server';
import { getActiveScenarios } from '@/lib/mock-data';

export const runtime = 'edge';

export async function GET() {
  try {
    const scenarios = getActiveScenarios();
    return NextResponse.json({ success: true, scenarios });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch scenarios' }, { status: 500 });
  }
}
