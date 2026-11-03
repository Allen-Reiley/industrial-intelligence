'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, X, FileText, Check, User, Mail, Briefcase, Phone, Building2 } from 'lucide-react';
import posthog from 'posthog-js';

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

const AuraConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [formStep, setFormStep] = useState<1 | 2>(1); // Sub-steps for Phase 2
  const [isConsented, setIsConsented] = useState(false);
  const [isEnriched, setIsEnriched] = useState(false);
  const [auraId, setAuraId] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [companyName, setCompanyName] = useState('');

  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('aura_consent_given') === 'true';
    const enriched = localStorage.getItem('aura_lead_captured') === 'true';
    const id = localStorage.getItem('aura_uid') || (window as any).AURA_UID || 'anon-visitor';
    
    setIsConsented(consent);
    setIsEnriched(enriched);
    setAuraId(id);

    // Initial phase setup on load
    if (!consent) {
      const initialTimer = setTimeout(() => {
        setIsVisible(true);
        setPhase(1);
      }, 2500);
      return () => clearTimeout(initialTimer);
    } else if (!enriched) {
      // Consent was already given but details have not been submitted yet
      setIsVisible(true);
      setPhase(2);
      setFormStep(1);
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
        setFormStep(1);
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

    const clientId = (window as any).AURA_ID || (window as any).AURA_AGENCY_ID || 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0';
    
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
      if (isPostHogConfigured) {
        posthog.capture('consent_accepted', { phase });
      }
    } catch (err) {
      console.error("⚠️ AuraWorks: Consent sync failed.", err);
    }

    // Trigger local updates
    window.dispatchEvent(new CustomEvent('aura_consent_updated', { 
      detail: { status: 'accepted', source: 'react_banner' } 
    }));

    // Transition directly to Phase 2 contact details form
    setPhase(2);
    setFormStep(1);
    setIsVisible(true);
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) return;

    // Immediately save parameters to storage
    localStorage.setItem('aura_first_name', firstName);
    localStorage.setItem('aura_last_name', lastName);
    localStorage.setItem('aura_phone', phone);

    // Dispatch lead details gathered so far immediately to the tracker
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aura_warm_lead', {
        detail: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          name: `${firstName} ${lastName}`,
          capture_source: 'banner_warm_signal_part1'
        }
      }));
    }

    setFormStep(2);
  };

  const handleEnrichmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;

    localStorage.setItem('aura_lead_captured', 'true');
    setIsEnriched(true);

    // Dispatch full lead details custom event to notify aura.js script
    window.dispatchEvent(new CustomEvent('aura_warm_lead', {
      detail: {
        email,
        company: companyName,
        company_name: companyName,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        position: role,
        phone: phone,
        capture_source: 'banner_warm_signal'
      }
    }));

    const clientId = (window as any).AURA_ID || (window as any).AURA_AGENCY_ID || 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0';
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/prospects/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          aura_id: auraId,
          client_id: clientId,
          company: companyName,
          company_name_raw: companyName,
          name: `${firstName} ${lastName}`,
          department: role,
          position: role,
          phone: phone,
          full_capture: true
        })
      });
      if (isPostHogConfigured) {
        posthog.capture('lead_enrichment_submitted');
      }
    } catch (err) {
      console.error("Prospect full capture failed", err);
    }

    setIsVisible(false);
  };

  const handleExitIntentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined' || !email) return;

    localStorage.setItem('aura_consent_given', 'true');
    setIsConsented(true);

    const clientId = (window as any).AURA_ID || (window as any).AURA_AGENCY_ID || 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0';

    // Dispatch custom event to notify aura.js script
    window.dispatchEvent(new CustomEvent('aura_warm_lead', {
      detail: {
        email,
        capture_source: 'banner_exit_intent'
      }
    }));

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/prospects/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          aura_id: auraId,
          client_id: clientId,
          full_capture: false
        })
      });
    } catch (err) {
      console.error("Prospect exit intent capture failed", err);
    }

    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || (isConsented && isEnriched)) return null;

  // Render Modal Lock Cover for Phase 04
  if (phase === 4) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-[#0c0c0c] border border-slate-800/40 p-8 rounded-xl max-w-[480px] w-full shadow-[0_0_80px_rgba(255,255,255,0.05)] text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-slate-950/50 border border-slate-800/50 flex items-center justify-center text-slate-400">
              <FileText size={28} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-slate-100 text-xl font-bold tracking-tight">Access Technical Resource</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              To open blueprint schematics, CAD files, or technical datasheets, please share your business email so we can send the files directly to your inbox and establish a connection.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAcceptConsent(); }} className="space-y-4">
            <div className="relative text-left">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="Enter corporate email..."
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 py-3 pl-10 pr-4 rounded text-slate-100 text-sm outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={!email || !email.includes('@')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded transition-all active:scale-95 shadow-lg shadow-emerald-950/20"
              >
                Send Files & Connect
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-slate-500 hover:text-slate-300 text-xs font-semibold"
              >
                Cancel Request
              </button>
            </div>
          </form>
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
                Identity Bridge v3.2
              </span>
            </div>
            <button onClick={handleDismiss} className="text-slate-600 hover:text-slate-300 transition-colors">
              <X size={16} />
            </button>
          </div>

          {phase === 1 && (
            <div className="space-y-4">
              <h3 className="text-slate-100 text-base font-semibold tracking-tight">
                Let's Connect
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                We noticed you may be interested in our product. May we reach out for further communication?
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAcceptConsent}
                  className="flex-grow py-3 bg-slate-50 hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded transition-all active:scale-95"
                >
                  Authorize
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-3 text-slate-500 hover:text-slate-300 text-xs font-semibold"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}

          {phase === 2 && (
            <form onSubmit={handleEnrichmentSubmit} className="space-y-4">
              <div className="flex border-b border-slate-900 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className={`flex-1 pb-1 text-center border-b-2 transition-all ${formStep === 1 ? 'border-emerald-500 text-slate-200' : 'border-transparent'}`}
                >
                  Contact Info
                </button>
                <button
                  type="button"
                  onClick={() => firstName && lastName && phone && setFormStep(2)}
                  disabled={!firstName || !lastName || !phone}
                  className={`flex-grow flex-1 pb-1 text-center border-b-2 transition-all disabled:opacity-30 ${formStep === 2 ? 'border-emerald-500 text-slate-200' : 'border-transparent'}`}
                >
                  Company Details
                </button>
              </div>

              {formStep === 1 ? (
                <div className="space-y-3 animate-in slide-in-from-left duration-200">
                  <h4 className="text-slate-200 text-xs font-semibold">Who should we contact?</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="First Name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 py-2 pl-8 pr-3 rounded text-slate-100 text-xs outline-none transition-colors animate-none"
                      />
                    </div>
                    <div className="relative">
                      <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Last Name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 py-2 pl-8 pr-3 rounded text-slate-100 text-xs outline-none transition-colors animate-none"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Direct Phone Number"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 py-2 pl-8 pr-3 rounded text-slate-100 text-xs outline-none transition-colors animate-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!firstName || !lastName || !phone}
                    className="w-full py-3 bg-slate-50 hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-white/5"
                  >
                    <span>Next Step</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-right duration-200">
                  <h4 className="text-slate-200 text-xs font-semibold">How can we support your organization?</h4>
                  <div className="relative">
                    <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      placeholder="Work Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 py-2 pl-8 pr-3 rounded text-slate-100 text-xs outline-none transition-colors animate-none"
                    />
                  </div>
                  <div className="relative">
                    <Building2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Company Name"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 py-2 pl-8 pr-3 rounded text-slate-100 text-xs outline-none transition-colors animate-none"
                    />
                  </div>
                  <div className="relative">
                    <Briefcase size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Job Position (e.g., Lead Engineer)"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 py-2 pl-8 pr-3 rounded text-slate-100 text-xs outline-none transition-colors animate-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!email || !companyName || !role}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded transition-all shadow-lg"
                  >
                    Send Connection Request
                  </button>
                </div>
              )}
            </form>
          )}

          {phase === 3 && (
            <form onSubmit={handleExitIntentSubmit} className="space-y-4">
              <h3 className="text-slate-100 text-base font-semibold tracking-tight">
                Leaving so soon?
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                If you'd like our SADC regional procurement spec guides and monthly industrial reports emailed to you, share your work email below.
              </p>
              <div className="relative">
                <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="Enter business email..."
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 py-2 pl-8 pr-3 rounded text-slate-100 text-xs outline-none transition-colors animate-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!email || !email.includes('@')}
                  className="flex-grow py-3 bg-slate-50 hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded disabled:opacity-50 transition-all active:scale-95"
                >
                  Email Me the Guides
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-4 py-3 text-slate-500 hover:text-slate-300 text-xs font-semibold"
                >
                  Exit Site
                </button>
              </div>
            </form>
          )}

          <p className="text-[8px] text-slate-600 leading-tight mt-4 text-center">
            AuraWorks (Pty) Ltd — Industrial Intelligence Solutions
          </p>
        </div>
      </div>
    </>
  );
};

export default AuraConsentBanner;