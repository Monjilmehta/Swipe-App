import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode, getAllRooms, createRoom, getActiveScenarios } from '@/lib/mock-data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  try {
    if (code) {
      const room = getRoomByCode(code);
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }
      const scenarios = getActiveScenarios();
      return NextResponse.json({ success: true, room, scenarios });
    }

    const rooms = getAllRooms();
    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { title?: string };
    const { title } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title required' }, { status: 400 });
    }

    const room = createRoom(title);
    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ success: false, error: 'Failed to create room' }, { status: 500 });
  }
}
