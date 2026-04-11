'use client';

import React, { useState } from 'react';
import { ArrowRight, X, Shield } from 'lucide-react';

// --- THE INTERFACE ALIGNMENT ---
interface LeadEnrichmentProps {
  auraId: string | null;
  onComplete: () => void; // This matches the call in consent-banner.tsx
  onDismiss: () => void;
}

const LeadEnrichmentSlide = ({ auraId, onComplete, onDismiss }: LeadEnrichmentProps) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState({ department: '', role: '' });

  const handleEmailNext = async () => {
    if (!email) return;
    
    // Store email immediately on 'Next'
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          aura_id: auraId,
          partial_capture: true 
        })
      });
      setStep(2);
    } catch (err) {
      setStep(2); // UX Resilience: Proceed even if sync hangs
    }
  };

  const handleFinalSubmit = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          aura_id: auraId,
          industry: position.department,
          avg_price: position.role, 
          full_capture: true
        })
      });
      onComplete(); // Effectively sets 'aura_lead_captured' in parent
    } catch (err) {
      onComplete();
    }
  };

  return (
    <div className="bg-[#0a0a0a]/95 backdrop-blur-3xl border border-slate-800/50 p-8 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full max-w-[400px] animate-in slide-in-from-right-10 duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Intelligence Phase 02</span>
        </div>
        <button onClick={onDismiss} className="text-slate-600 hover:text-slate-300 transition-colors">
          <X size={16}/>
        </button>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-slate-100 text-lg font-semibold italic tracking-tight">Refine Signal Quality</h3>
            <p className="text-slate-400 text-[13px] leading-relaxed font-light">
              Provide your work email to receive clinical B2B outreach and facility-specific ROI reports.
            </p>
          </div>
          
          <input 
            type="email" 
            placeholder="Work Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-slate-800 py-3 text-slate-100 text-sm focus:border-emerald-500 transition-colors outline-none"
          />

          <div className="flex items-center gap-4 pt-2">
            <button 
              onClick={handleEmailNext} 
              className="flex-1 py-3 bg-slate-50 hover:bg-white text-black text-[10px] font-black uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Next Step <ArrowRight size={14} />
            </button>
            <button 
              onClick={onDismiss} 
              className="text-slate-500 text-[10px] font-bold uppercase hover:text-slate-300 transition-colors"
            >
              No Thanks
            </button>
          </div>
          
          <div className="flex items-center gap-2 pt-4">
            <Shield size={10} className="text-slate-600" />
            <p className="text-[9px] text-slate-600 leading-tight">
              Subject to <a href="/legal/privacy" className="underline hover:text-slate-400">Privacy Policy</a> and <a href="/legal/terms" className="underline hover:text-slate-400">Data Processing Addenda</a>.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
          <div className="space-y-2">
            <h3 className="text-slate-100 text-lg font-semibold tracking-tight">Organizational Role</h3>
            <p className="text-slate-400 text-[13px] font-light leading-relaxed">Categorize your professional influence within the facility.</p>
          </div>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Department (e.g. Procurement)" 
              onChange={(e) => setPosition({...position, department: e.target.value})}
              className="w-full bg-transparent border-b border-slate-800 py-2 text-slate-100 text-sm focus:border-emerald-500 outline-none transition-colors"
            />
            <input 
              type="text" 
              placeholder="Current Position" 
              onChange={(e) => setPosition({...position, role: e.target.value})}
              className="w-full bg-transparent border-b border-slate-800 py-2 text-slate-100 text-sm focus:border-emerald-500 outline-none transition-colors"
            />
          </div>

          <button 
            onClick={handleFinalSubmit} 
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            Complete Industrial Sync
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadEnrichmentSlide;