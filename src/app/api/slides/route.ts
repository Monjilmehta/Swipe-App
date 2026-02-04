import { NextResponse } from 'next/server';
import { getAllRevealSlides } from '@/lib/mock-data';

export const runtime = 'edge';

export async function GET() {
  try {
    const slides = getAllRevealSlides();
    return NextResponse.json({ success: true, slides });
  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch slides' }, { status: 500 });
  }
}
