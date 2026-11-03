'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { trackIntent } from '@/lib/api';

const DEFAULT_CLIENT_ID = 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0';
const IMAGEKIT_VIDEO_URL = 'https://ik.imagekit.io/lcpi94xy3/final-demo.mp4';

export default function VSLFunnel() {
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [clientId, setClientId] = useState(DEFAULT_CLIENT_ID);
  const [auraId, setAuraId] = useState('anonymous-vsl-visitor');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sentMilestones = useRef<Set<number>>(new Set());
  const abandonmentTimer = useRef<NodeJS.Timeout | null>(null);
  const ctaClicked = useRef(false);

  useEffect(() => {
    setHasHydrated(true);

    // Get client ID from environment or fallback
    const envClientId = process.env.NEXT_PUBLIC_WAITLIST_API_KEY;
    if (envClientId) {
      setClientId(envClientId);
    }

    // Get forensic signature from localStorage
    const savedAuraId = localStorage.getItem('aura_uid');
    if (savedAuraId) {
      setAuraId(savedAuraId);
    }
  }, []);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.error('Failed to play video:', err);
      });
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setIsEnded(false);
    setShowCTA(false);
    sentMilestones.current.clear();
    ctaClicked.current = false;
    if (abandonmentTimer.current) {
      clearTimeout(abandonmentTimer.current);
    }
    videoRef.current.play().catch((err) => {
      console.error('Failed to play video:', err);
    });
  };

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (!duration || isNaN(duration)) return;

    const percentage = Math.floor((currentTime / duration) * 100);
    const milestones = [25, 50, 75, 100];

    milestones.forEach((milestone) => {
      if (percentage >= milestone && !sentMilestones.current.has(milestone)) {
        sentMilestones.current.add(milestone);
        trackIntent({
          client_id: clientId,
          aura_id: auraId,
          vsl_completion_percentage: milestone,
        }).catch((err) => {
          console.error(`Failed to track milestone ${milestone}%:`, err);
        });
      }
    });
  };

  const onEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    setShowCTA(true);

    // Track 100% completion explicitly if timeupdate missed it
    if (!sentMilestones.current.has(100)) {
      sentMilestones.current.add(100);
      trackIntent({
        client_id: clientId,
        aura_id: auraId,
        vsl_completion_percentage: 100,
      }).catch((err) => {
        console.error('Failed to track 100% completion milestone:', err);
      });
    }

    // Warm abandonment tracking logic: 10 seconds timeout
    abandonmentTimer.current = setTimeout(() => {
      if (!ctaClicked.current) {
        trackIntent({
          client_id: clientId,
          aura_id: auraId,
          vsl_completion_percentage: 100,
          vsl_abandoned: true,
        }).catch((err) => {
          console.error('Failed to track warm abandonment:', err);
        });
      }
    }, 10000);
  };

  const handleCtaClick = () => {
    ctaClicked.current = true;
    if (abandonmentTimer.current) {
      clearTimeout(abandonmentTimer.current);
    }

    // Ping final status to clear abandonment flag
    trackIntent({
      client_id: clientId,
      aura_id: auraId,
      vsl_completion_percentage: 100,
      vsl_abandoned: false,
    })
      .catch((err) => {
        console.error('Failed to clear abandonment flag:', err);
      })
      .finally(() => {
        router.push('/book-demo');
      });
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Subtle Go Back button */}
      <button
        onClick={handleGoBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group z-10 py-2 px-3 rounded-lg hover:bg-zinc-100"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-sm font-medium">Go Back</span>
      </button>

      <div className="w-full max-w-4xl flex flex-col items-center z-10 space-y-8 mt-12 md:mt-0">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            AuraWorks Discoverability & Intelligence
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent leading-tight tracking-tight">
            How It Works
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Learn how AuraWorks unites search dominance and AI engine citability with proprietary visitor intelligence to convert anonymous industrial traffic into pipeline.
          </p>
        </div>

        {/* Video Player Card */}
        <div className="w-full bg-zinc-50/50 border border-border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl relative group">
          <div className="aspect-video w-full relative bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={IMAGEKIT_VIDEO_URL}
              onClick={handlePlayPause}
              onPlay={onPlay}
              onPause={onPause}
              onTimeUpdate={onTimeUpdate}
              onEnded={onEnded}
              className="w-full h-full object-cover"
              playsInline
            />

            {/* Play/Pause/Restart Overlay on Video Hover */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
                className="w-16 h-16 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all scale-95 group-hover:scale-100 pointer-events-auto cursor-pointer"
              >
                {isEnded ? (
                  <RotateCcw className="w-6 h-6" onClick={(e) => { e.stopPropagation(); handleRestart(); }} />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Delayed CTA Reveal */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl text-center space-y-6 flex flex-col items-center"
            >
              <div className="space-y-2">
                <p className="text-lg md:text-xl font-medium text-foreground">
                  Ready to de-anonymize your website traffic?
                </p>
                <p className="text-sm text-muted-foreground">
                  Secure your 15-minute operational audit and live platform demo.
                </p>
              </div>

              <button
                onClick={handleCtaClick}
                className="w-full max-w-md py-4 px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer"
              >
                Book Demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
