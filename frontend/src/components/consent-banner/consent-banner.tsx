'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, X, FileText, Check } from 'lucide-react';

const AuraConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [isConsented, setIsConsented] = useState(false);
  const [isEnriched, setIsEnriched] = useState(false);
  const [auraId, setAuraId] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('aura_consent_given') === 'true';
    const enriched = localStorage.getItem('aura_lead_captured') === 'true';
    const id = localStorage.getItem('aura_uid') || (window as any).AURA_UID || 'anon-visitor';
    
    setIsConsented(consent);
    setIsEnriched(enriched);
    setAuraId(id);

    // Phase 01: Slide-in after 2.5s initial delay
    if (!consent) {
      const initialTimer = setTimeout(() => {
        setIsVisible(true);
        setPhase(1);
      }, 2500);
      return () => clearTimeout(initialTimer);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || isConsented) return;

    // Phase 02: Scroll Ceiling (50%) Trigger
    const handleScroll = () => {
      if (isConsented || phase === 4) return;
      const scrollPct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPct >= 0.5 && phase !== 2) {
        setIsVisible(true);
        setPhase(2);
      }
    };

    // Phase 03: Exit Intent Trigger
    const handleMouseLeave = (e: MouseEvent) => {
      if (isConsented || phase === 4 || e.clientY >= 50) return;
      setIsVisible(true);
      setPhase(3);
    };

    // Phase 04: Intercept CAD/Spec Sheet/PDF downloads
    const handleDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (anchor && anchor.href) {
        const href = anchor.href.toLowerCase();
        if (href.match(/\.(pdf|zip|dwg|dxf|cad|step|igs)$/)) {
          const consent = localStorage.getItem('aura_consent_given') === 'true';
          if (!consent) {
            e.preventDefault();
            setIsVisible(true);
            setPhase(4);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isConsented, phase]);

  const handleAcceptConsent = async () => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('aura_consent_given', 'true');
    setIsConsented(true);

    const clientId = (window as any).AURA_ID || 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0';
    
    // Dispatch telemetry event to promote lead
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/track/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          aura_id: auraId,
          status: 'accepted'
        })
      });
    } catch (err) {
      console.error("⚠️ AuraWorks: Consent sync failed.", err);
    }

    // Trigger local updates
    window.dispatchEvent(new CustomEvent('aura_consent_updated', { 
      detail: { status: 'accepted', source: 'react_banner' } 
    }));

    // If it was Phase 4 (asset gate) or 3 (exit intent), transition to next form step or dismiss
    if (phase === 4 || phase === 2) {
      // Transition to enrichment questions
      setPhase(2);
    } else {
      setIsVisible(false);
    }
  };

  const handleEnrichmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;

    localStorage.setItem('aura_lead_captured', 'true');
    setIsEnriched(true);

    // Dispatch custom event to notify aura.js script
    window.dispatchEvent(new CustomEvent('aura_warm_lead', {
      detail: {
        email,
        company: firstName + ' ' + lastName, // map fields cleanly
        department: role,
        position: phone
      }
    }));

    const clientId = (window as any).AURA_ID || 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0';
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          aura_id: auraId,
          company_name_raw: `${firstName} ${lastName}`,
          industry: role,
          avg_price: phone,
          full_capture: true
        })
      });
    } catch (err) {
      console.error("Waitlist full capture failed", err);
    }

    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || isConsented && isEnriched) return null;

  // Render Modal Lock Cover for Phase 04
  if (phase === 4) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
        <div className="bg-[#0c0c0c] border border-red-900/40 p-8 rounded-xl max-w-[480px] w-full shadow-[0_0_80px_rgba(239,68,68,0.15)] text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
              <FileText size={28} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-slate-100 text-xl font-bold tracking-tight">Technical Specification Gate</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Access to blueprint schematics, CAD files, and chemical composition datasheets requires business identity authentication.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg text-left space-y-3">
            <input
              type="email"
              placeholder="Enter corporate email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 py-3 px-4 rounded text-slate-100 text-sm outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAcceptConsent}
              disabled={!email || !email.includes('@')}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded transition-all active:scale-95 shadow-lg shadow-red-950/20"
            >
              Verify Identity & Unlock
            </button>
            <button
              onClick={handleDismiss}
              className="text-slate-500 hover:text-slate-300 text-xs font-semibold"
            >
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 🛡️ HONEY POT: Bot detection link */}
      <a 
        href="#" 
        id="aura-v-check" 
        style={{ display: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      >
        Verify Browser Architecture
      </a>

      <div 
        ref={bannerRef}
        className="fixed bottom-8 right-8 z-[9999] max-w-[400px] w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out p-4"
        role="alert"
      >
        <div className="bg-[#0a0a0a]/95 backdrop-blur-3xl border border-slate-800/50 p-6 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">
                AURA SHIELD V3.2
              </span>
            </div>
            <button onClick={handleDismiss} className="text-slate-600 hover:text-slate-300 transition-colors">
              <X size={16} />
            </button>
          </div>

          {phase === 1 && (
            <div className="space-y-4">
              <h3 className="text-slate-100 text-base font-semibold tracking-tight">
                Corporate Identity Verification
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                We notice you are accessing from an industrial network node. Authorize telemetry mapping to unlock detailed facility specification sheets.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAcceptConsent}
                  className="flex-grow py-3 bg-slate-50 hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded transition-all active:scale-95"
                >
                  Verify Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-3 text-slate-500 hover:text-slate-300 text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {phase === 2 && (
            <form onSubmit={handleEnrichmentSubmit} className="space-y-4">
              <h3 className="text-slate-100 text-base font-semibold tracking-tight">
                Enterprise Specification Access
              </h3>
              <p className="text-slate-400 text-xs font-light">
                Fill in details to prioritize your company connection request.
              </p>

              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Business Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 py-2 px-3 rounded text-slate-100 text-xs outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-slate-950 border border-slate-900 focus:border-emerald-500 py-2 px-3 rounded text-slate-100 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-slate-950 border border-slate-900 focus:border-emerald-500 py-2 px-3 rounded text-slate-100 text-xs outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Corporate Role (e.g. Chief Engineer)"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 py-2 px-3 rounded text-slate-100 text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 py-2 px-3 rounded text-slate-100 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded transition-all shadow-lg"
              >
                Complete Specification Registration
              </button>
            </form>
          )}

          {phase === 3 && (
            <div className="space-y-4">
              <h3 className="text-slate-100 text-base font-semibold tracking-tight">
                Leaving so soon?
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Sign up before exiting to receive our SADC regional procurement spec guides and monthly mining audits.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter business email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 py-2 px-3 rounded text-slate-100 text-xs outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAcceptConsent}
                  disabled={!email || !email.includes('@')}
                  className="flex-grow py-3 bg-slate-50 hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded disabled:opacity-50 transition-all active:scale-95"
                >
                  Register Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-3 text-slate-500 hover:text-slate-300 text-xs font-semibold"
                >
                  Exit Site
                </button>
              </div>
            </div>
          )}

          <p className="text-[8px] text-slate-600 leading-tight mt-4 text-center">
            AuraWorks (Pty) Ltd — B2B Telemetry & Intent Resolution
          </p>
        </div>
      </div>
    </>
  );
};

export default AuraConsentBanner;