'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import posthog from 'posthog-js';

const STORAGE_KEY = 'aura_cookie_consent';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if the user has already recorded cookie consent
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Delay display slightly for smooth page entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (consent === 'declined') {
      // Ensure PostHog remains opted-out if previously declined
      try {
        if (posthog && typeof posthog.opt_out_capturing === 'function') {
          posthog.opt_out_capturing();
        }
      } catch {
        // PostHog might not be initialized
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      document.cookie = `${STORAGE_KEY}=accepted; path=/; max-age=31536000; SameSite=Lax`;
      try {
        if (posthog && typeof posthog.opt_in_capturing === 'function') {
          posthog.opt_in_capturing();
        }
      } catch {
        // ignore
      }
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'declined');
      document.cookie = `${STORAGE_KEY}=declined; path=/; max-age=31536000; SameSite=Lax`;
      try {
        if (posthog && typeof posthog.opt_out_capturing === 'function') {
          posthog.opt_out_capturing();
        }
      } catch {
        // ignore
      }
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie Consent Banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-neutral-900/95 dark:bg-neutral-950/95 text-neutral-100 border border-neutral-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-neutral-800 text-amber-400 shrink-0">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="flex-1 text-xs leading-relaxed space-y-1.5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-neutral-100 flex items-center gap-1.5">
                Cookie & Privacy Consent
              </h2>
              <button
                type="button"
                onClick={handleDecline}
                className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
                aria-label="Close and decline non-essential cookies"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-neutral-300">
              We collect essential cookies for platform security, plus analytics and forensic telemetry cookies (Google Analytics, PostHog) to understand visitor traffic in accordance with POPIA.
            </p>

            <div className="pt-1">
              <Link
                href="/cookies-policy"
                className="text-amber-400 hover:underline inline-flex items-center gap-1 text-[11px] font-medium"
              >
                <ShieldCheck className="h-3 w-3" />
                Read our Cookies & Forensic Telemetry Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 text-xs font-medium text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors font-semibold shadow-sm"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
