'use client';

import React, { useEffect, useState } from 'react';

const AuraConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already interacted
    const hasConsent = typeof window !== 'undefined' && localStorage.getItem('aura_consent_given');
    
    if (!hasConsent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = async () => {
    const auraId = typeof window !== 'undefined' ? (localStorage.getItem('aura_uid') || (window as any).AURA_UID) : null;
    const clientId = typeof window !== 'undefined' ? (window as any).AURA_ID : null;

    // 1. Mark consent in LocalStorage for UI persistence
    localStorage.setItem('aura_consent_given', 'true');
    
    // 2. GATE 1 HANDSHAKE: Notify Backend for Identity Promotion
    if (auraId && clientId) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/track/consent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            aura_id: auraId,
            status: 'accepted'
          })
        });
      } catch (err) {
        console.error("⚠️ AuraWorks: Background consent sync failed.", err);
      }
    }

    // 3. Dispatch CustomEvent for aura.js (Triggers immediate forensic reveal)
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('aura_consent_updated', { 
        detail: { status: 'accepted', source: 'executive_bridge' } 
      }));
    }

    setIsVisible(false);
    console.log("✅ AuraWorks: Identity Resolution Authorized. Jurisdictive Entity Research Initiated.");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Note: We don't set 'aura_consent_given' here, ensuring the lead is reminded on return.
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 🛡️ THE HONEY POT: Bot Detection */}
      <a 
        href="#" 
        id="aura-v-check" 
        style={{ display: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      >
        Verify Browser Architecture
      </a>

      {/* 🎨 THE UI: Executive Identity Bridge Banner */}
      <div 
        className="fixed bottom-8 right-8 z-[9999] max-w-[400px] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
        role="alert"
        aria-labelledby="aura-banner-title"
      >
        <div className="bg-[#0a0a0a]/95 backdrop-blur-3xl border border-slate-800/50 p-8 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col space-y-6">
            
            {/* Live Status Header */}
            <div className="flex items-center space-x-3">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">
                Identity Bridge v2.2.2
              </span>
            </div>
            
            <div className="space-y-3">
              <h3 id="aura-banner-title" className="text-slate-100 text-lg font-semibold tracking-tight">
                Business Identity Resolution
              </h3>
              <p className="text-slate-400 text-[13px] leading-relaxed font-light">
                Utilize forensic hardware signals to synchronize your professional persona with our B2B intelligence suite. This authorized sync enables strategic outreach via <span className="text-slate-100 font-medium border-b border-slate-700">LinkedIn and Corporate Channels</span>.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleAccept}
                className="flex-1 py-3 bg-slate-50 hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded transition-all active:scale-95 shadow-xl shadow-white/5"
              >
                Authorize Sync
              </button>
              <button
                onClick={handleDismiss}
                className="px-5 py-3 text-slate-500 hover:text-slate-300 text-[11px] font-semibold transition-colors"
              >
                Dismiss
              </button>
            </div>

            <p className="text-[9px] text-slate-600 italic text-center">
              AuraWorks (Pty) Ltd - Industrial-Grade Precision Analytics
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuraConsentBanner;