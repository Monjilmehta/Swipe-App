'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function RoomRevealPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = use(params);
  const router = useRouter();

  useEffect(() => {
    // Store the room code and redirect to main reveal
    localStorage.setItem('swipe-room-code', roomCode);
    router.replace('/reveal');
  }, [roomCode, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
