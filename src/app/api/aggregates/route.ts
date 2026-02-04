import { NextResponse } from 'next/server';
import { getAggregates } from '@/lib/mock-data';

export const runtime = 'edge';

export async function GET() {
  try {
    const aggregates = getAggregates();
    
    // Calculate total unique participants (approximation based on max responses)
    const maxResponses = Math.max(
      ...Object.values(aggregates).map(a => a.yes + a.no),
      0
    );

    return NextResponse.json({ 
      success: true, 
      aggregates,
      totalParticipants: maxResponses
    });
  } catch (error) {
    console.error('Error fetching aggregates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch aggregates' }, { status: 500 });
  }
}
