'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface RevealSlide {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  quote: string | null;
  quoteAuthor: string | null;
}

export default function RevealPage() {
  const router = useRouter();
  const [slides, setSlides] = useState<RevealSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      try {
        const response = await fetch('/api/slides');
        const data = await response.json() as { success?: boolean; slides?: RevealSlide[] };
        
        if (data.success && data.slides) {
          setSlides(data.slides);
        } else {
          const { getAllRevealSlides } = await import('@/lib/mock-data');
          setSlides(getAllRevealSlides());
        }
      } catch {
        const { getAllRevealSlides } = await import('@/lib/mock-data');
        setSlides(getAllRevealSlides());
      }
      setIsLoading(false);
    }
    
    loadSlides();
  }, []);

  const currentSlide = slides[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === slides.length - 1;

  const goNext = () => {
    if (!isLast) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (!isFirst) setCurrentIndex(currentIndex - 1);
  };

  const goHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-2xl w-full">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-purple-500 w-6'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-3xl p-8 min-h-[400px]"
          >
            {currentSlide && (
              <>
                <h2 className="text-3xl font-bold text-white mb-6">{currentSlide.title}</h2>
                
                {currentSlide.body && (
                  <div className="prose prose-invert prose-lg max-w-none mb-6">
                    <ReactMarkdown>{currentSlide.body}</ReactMarkdown>
                  </div>
                )}

                {currentSlide.quote && (
                  <blockquote className="border-l-4 border-purple-500 pl-4 my-6">
                    <p className="text-xl italic text-white/90">&ldquo;{currentSlide.quote}&rdquo;</p>
                    {currentSlide.quoteAuthor && (
                      <cite className="text-white/60 mt-2 block">— {currentSlide.quoteAuthor}</cite>
                    )}
                  </blockquote>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={goPrev}
            disabled={isFirst}
            variant="glass"
            size="lg"
            className="disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          {isLast ? (
            <Button
              onClick={goHome}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
              size="lg"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
