'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Countdown from "@/components/Countdown";
import Link from "next/link";
import { Lock, Snowflake, Heart } from "lucide-react";
import Image from "next/image";

const collageImages = [
  "https://i.pinimg.com/736x/0f/c8/1f/0fc81f9760f997ae49322d83b1c4336b.jpg",
  "https://i.pinimg.com/1200x/bc/b3/d7/bcb3d76f331d7d0ea9721020d34bb5b5.jpg",
  "https://i.pinimg.com/736x/8b/da/fe/8bdafeebcf5e5aa50269fe5c6f5f9f33.jpg",
  "https://i.pinimg.com/736x/05/4f/1e/054f1e5baef00ec33f67380cbd47d525.jpg",
];

type Surprise = {
  id: string;
  title: string;
  sub_text?: string;
  image_url: string;
  image_url_2?: string;
  created_at: string;
};

export default function Home() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [surprises, setSurprises] = useState<Surprise[]>([]);
  const [selectedSurpriseIndex, setSelectedSurpriseIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState({ revealed: 0, total: 32, daysPassed: 0, totalDays: 29 });

  const handleReveal = async () => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const isPreview = searchParams.get('preview') === 'true';
      const endpoint = isPreview ? '/api/surprises?revealAll=true' : '/api/surprises';
      
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      if (data.surprises && data.surprises.length > 0) {
        setSurprises(data.surprises);
        setIsRevealed(true);
        setSelectedSurpriseIndex(data.surprises.length - 1);
        setProgress({
          revealed: data.totalRevealed,
          total: data.totalImages,
          daysPassed: data.daysPassed,
          totalDays: data.totalDays,
        });
      } else {
        setMessage("No surprises available yet! Check back soon.");
      }
    } catch (error: any) {
      setMessage("Failed to load surprises.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const RightSideContent = ({ isFlipped }: { isFlipped: boolean }) => (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10 bg-slate-950/80 lg:bg-slate-950/50 min-h-[50vh] lg:min-h-0">
      {/* Text Box */}
      <div className="glass-panel rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-12 text-center shadow-2xl relative overflow-hidden border border-rose-500/30 bg-slate-900/60 backdrop-blur-xl w-full max-w-xl">
        {/* Subtle luxurious inner glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-400/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex justify-center mb-5 text-rose-300 opacity-90">
          <Heart size={32} className="animate-pulse drop-shadow-md" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100 drop-shadow-lg font-serif leading-tight">
          Birthday countdown for the most amazing girl ever
        </h1>
        
        <p className="text-xs sm:text-sm text-rose-200/80 mb-8 sm:mb-12 font-sans tracking-[0.2em] uppercase">
          Until October 1st, 2026
        </p>
        
        <div className="scale-95 sm:scale-100 transform origin-top">
          <Countdown />
        </div>
        
        <div className="mt-8 sm:mt-14 pt-6 sm:pt-8 border-t border-rose-900/50 w-full flex flex-col items-center relative">
          <div className="absolute -top-3 bg-slate-900/90 px-4 text-rose-300 rounded-full border border-rose-900/50 shadow-sm">
            <Snowflake size={16} className="animate-[spin_10s_linear_infinite]" />
          </div>
          <p className="text-rose-200/60 text-[10px] sm:text-xs mb-3 font-sans uppercase tracking-[0.2em] mt-4">{currentDate}</p>
          <p className="text-sm md:text-base font-serif italic text-amber-100/90 mb-10 max-w-lg leading-relaxed px-2 drop-shadow-sm">
            "Every passing day brings a new memory to light, as we wait to celebrate you."
          </p>
          
          {!isFlipped ? (
            <div className="flex flex-col items-center w-full">
              <button 
                onClick={handleReveal}
                disabled={isLoading}
                className="bg-gradient-to-r from-rose-300 to-amber-200 hover:from-rose-200 hover:to-amber-100 text-slate-900 font-serif font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(251,113,133,0.3)] hover:shadow-[0_0_25px_rgba(251,113,133,0.5)] disabled:opacity-50 text-lg w-full max-w-xs"
              >
                {isLoading ? 'Unlocking...' : "Reveal Today's Surprise"}
              </button>
              {message && <p className="mt-4 text-rose-300 font-serif text-center">{message}</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <h2 className="text-2xl font-serif text-rose-200 mb-2">Unlocked Memories</h2>
              <span className="text-sm bg-rose-900/30 text-rose-200 px-4 py-1.5 rounded-full border border-rose-800/50">
                {progress.revealed} / {progress.total} Unlocked
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ perspective: '1500px' }} className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Admin Link (always on top) */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/admin" className="text-slate-400 hover:text-slate-200 transition-colors p-2 bg-slate-900/60 rounded-full backdrop-blur-md border border-slate-700/50 block">
          <Lock size={16} />
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.main
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex min-h-screen flex-col lg:flex-row relative z-10 w-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Collage Section: 2 images on mobile, 4 on desktop */}
            <div className="w-full lg:w-1/2 h-[45vh] sm:h-[50vh] lg:h-screen grid grid-cols-2 gap-2 sm:gap-3 p-2 sm:p-4 z-0 lg:grid-rows-2">
               {/* Image 1: Always visible */}
               <div className="relative h-full w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-slate-800/50">
                  <Image src={collageImages[0]} alt="Collage 1" fill className="object-cover" priority />
               </div>
               {/* Image 2: Always visible */}
               <div className="relative h-full w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-slate-800/50">
                  <Image src={collageImages[1]} alt="Collage 2" fill className="object-cover" priority />
               </div>
               {/* Image 3: Hidden on mobile, visible on desktop */}
               <div className="relative h-full w-full hidden lg:block rounded-2xl overflow-hidden shadow-lg border border-slate-800/50">
                  <Image src={collageImages[2]} alt="Collage 3" fill className="object-cover" priority />
               </div>
               {/* Image 4: Hidden on mobile, visible on desktop */}
               <div className="relative h-full w-full hidden lg:block rounded-2xl overflow-hidden shadow-lg border border-slate-800/50">
                  <Image src={collageImages[3]} alt="Collage 4" fill className="object-cover" priority />
               </div>
            </div>

            <RightSideContent isFlipped={false} />
          </motion.main>
        ) : (
          <motion.main
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex min-h-screen flex-col lg:flex-row relative z-10 w-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Revealed Surprises Section (Replaces Collage) */}
            <div className="w-full lg:w-1/2 h-auto lg:h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 custom-scrollbar relative">
              
              {/* Quick Filters */}
              {surprises.length > 1 && (
                <div className="w-full flex gap-3 overflow-x-auto items-center py-4 px-1 sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-rose-900/20 no-scrollbar snap-x snap-mandatory">
                  {surprises.map((_, idx) => {
                    const reverseIdx = surprises.length - 1 - idx;
                    const isLatest = reverseIdx === surprises.length - 1;
                    const isSelected = selectedSurpriseIndex === reverseIdx;
                    
                    return (
                      <button
                        key={reverseIdx}
                        onClick={() => setSelectedSurpriseIndex(reverseIdx)}
                        className={`snap-center flex-shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full border text-sm font-serif transition-all duration-300 whitespace-nowrap ${isSelected ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 shadow-[0_0_15px_rgba(251,113,133,0.3)]' : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'}`}
                      >
                        Day {reverseIdx + 1} {isLatest && '(Latest)'}
                      </button>
                    )
                  })}
                </div>
              )}

              {surprises.length > 0 && (
                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-rose-900/30 text-center shadow-lg mb-2">
                  <p className="text-amber-100/90 font-serif text-lg leading-relaxed italic drop-shadow-sm">
                    Every day, you will get to know about the meaning of each episode of First Frost until your special day.
                  </p>
                </div>
              )}

              {/* Display the Selected Surprise */}
              {surprises[selectedSurpriseIndex] && (
                <div
                  key={surprises[selectedSurpriseIndex].id}
                  className="bg-slate-900/80 backdrop-blur-xl border border-rose-900/40 p-6 sm:p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="mb-6 w-full text-center">
                    <h3 className="text-2xl sm:text-3xl font-serif text-amber-100 tracking-wide mb-2 drop-shadow-md">{surprises[selectedSurpriseIndex].title}</h3>
                    {surprises[selectedSurpriseIndex].sub_text && (
                      <p className="text-sm sm:text-base text-rose-200/80 italic font-light">{surprises[selectedSurpriseIndex].sub_text}</p>
                    )}
                  </div>

                  <div className="w-full relative flex flex-col gap-6">
                    <img 
                      src={surprises[selectedSurpriseIndex].image_url} 
                      alt={surprises[selectedSurpriseIndex].title} 
                      className="w-full object-contain bg-slate-950/30 rounded-2xl shadow-inner border border-slate-700/50 h-auto max-h-[28rem]"
                    />
                    {surprises[selectedSurpriseIndex].image_url_2 && (
                      <img 
                        src={surprises[selectedSurpriseIndex].image_url_2} 
                        alt={surprises[selectedSurpriseIndex].title + " 2"} 
                        className="w-full object-contain bg-slate-950/30 rounded-2xl shadow-inner border border-slate-700/50 h-auto max-h-[28rem]"
                      />
                    )}
                  </div>
                  
                  <div className="mt-6 text-xs text-rose-400/60 uppercase tracking-widest flex items-center gap-4">
                     <span className="w-16 h-[1px] bg-rose-500/30 inline-block"></span>
                     Memory #{selectedSurpriseIndex + 1}
                     <span className="w-16 h-[1px] bg-rose-500/30 inline-block"></span>
                  </div>
                </div>
              )}
              
              {/* Spacer at the bottom so the last item isn't flush with the scroll edge */}
              <div className="h-8 w-full flex-shrink-0"></div>
            </div>

            <RightSideContent isFlipped={true} />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
