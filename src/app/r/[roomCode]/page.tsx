'use client';

import { useState, useCallback, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeDeck, Scenario } from '@/components/swipe/SwipeDeck';
import { nanoid } from 'nanoid';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('swipe-session-id');
  if (!sessionId) {
    sessionId = nanoid(12);
    localStorage.setItem('swipe-session-id', sessionId);
  }
  return sessionId;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function RoomPlayPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = use(params);
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [roomTitle, setRoomTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);
    
    async function loadRoom() {
      try {
        const response = await fetch(`/api/rooms?code=${roomCode}`);
        const data = await response.json() as { success?: boolean; room?: { title: string }; scenarios?: Scenario[] };
        
        if (data.success && data.room) {
          setRoomTitle(data.room.title);
          if (data.scenarios) {
            setScenarios(shuffleArray(data.scenarios));
          }
        } else {
          setError('Room not found');
        }
      } catch {
        setError('Failed to load room');
      }
      setIsReady(true);
    }
    
    loadRoom();
  }, [roomCode]);

  const handleSwipe = useCallback(async (scenarioId: string, answer: 'yes' | 'no') => {
    try {
      await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          scenarioId,
          answer,
          roomCode,
        }),
      });
    } catch (err) {
      console.error('Error saving answer:', err);
    }
  }, [sessionId, roomCode]);

  const handleUndo = useCallback(async (scenarioId: string) => {
    try {
      await fetch(`/api/answers?sessionId=${sessionId}&scenarioId=${scenarioId}&roomCode=${roomCode}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error undoing answer:', err);
    }
  }, [sessionId, roomCode]);

  const handleComplete = useCallback(() => {
    localStorage.setItem('swipe-room-code', roomCode);
    router.push(`/r/${roomCode}/results`);
  }, [router, roomCode]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="glass-card rounded-3xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 rounded-xl text-white font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatePresence mode="wait">
        {showInstructions ? (
          <motion.div
            key="instructions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4"
          >
            <motion.div className="max-w-md w-full text-center">
              <div className="glass-card rounded-3xl p-8 mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">{roomTitle || 'Welcome'}</h1>
                <p className="text-white/60 mb-6">Room: {roomCode}</p>
                
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👉</span>
                    <p className="text-white/80">Swipe right for YES</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👈</span>
                    <p className="text-white/80">Swipe left for NO</p>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={() => setShowInstructions(false)}
                className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SwipeDeck
              scenarios={scenarios}
              onSwipe={handleSwipe}
              onUndo={handleUndo}
              onComplete={handleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
