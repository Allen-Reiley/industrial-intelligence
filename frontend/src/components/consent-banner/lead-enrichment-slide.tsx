'use client';

import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

// 1. Fixed Interface: Explicitly define onComplete to satisfy TS(2322)
interface LeadEnrichmentProps {
  auraId: string | null;
  onComplete: () => void; // Critical addition
  onDismiss: () => void;
}

const LeadEnrichmentSlide = ({ auraId, onComplete, onDismiss }: LeadEnrichmentProps) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState({ company: '', department: '', role: '' });

  const handleEmailNext = async () => {
    if (!email) return;
    
    // Immediate storage of email on 'Next'
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
      console.error("Partial capture failed", err);
      setStep(2); 
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
          company_name_raw: position.company, // Aligned with backend column name from logs
          industry: position.department,
          avg_price: position.role, 
          full_capture: true
        })
      });
      onComplete(); // Successfully close the bridge
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
            <button onClick={onDismiss} className="text-slate-500 text-[10px] font-bold uppercase hover:text-slate-300">
              No Thanks
            </button>
          </div>
          
          <div className="pt-4 border-t border-slate-900">
             <p className="text-[9px] text-slate-600 leading-tight">
              By proceeding, you authorize industrial synchronization. View our <a href="/legal/privacy" className="underline hover:text-slate-400">Privacy Policy</a>.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
          <div className="space-y-2">
            <h3 className="text-slate-100 text-lg font-semibold tracking-tight">Organizational Role</h3>
            <p className="text-slate-400 text-[13px] font-light leading-relaxed">Categorize your professional influence.</p>
          </div>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Company" 
              value={position.company}
              onChange={(e) => setPosition({...position, company: e.target.value})}
              className="w-full bg-transparent border-b border-slate-800 py-2 text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
            <input 
              type="text" 
              placeholder="Department" 
              value={position.department}
              onChange={(e) => setPosition({...position, department: e.target.value})}
              className="w-full bg-transparent border-b border-slate-800 py-2 text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
            <input 
              type="text" 
              placeholder="Position" 
              value={position.role}
              onChange={(e) => setPosition({...position, role: e.target.value})}
              className="w-full bg-transparent border-b border-slate-800 py-2 text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <button 
            onClick={handleFinalSubmit} 
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded transition-all shadow-lg"
          >
            Complete Industrial Sync
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadEnrichmentSlide;