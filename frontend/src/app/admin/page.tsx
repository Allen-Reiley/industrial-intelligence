"use client";
import { useEffect, useState } from 'react';

// Optimized Lead interface to match the WaitlistLead + Visit forensics
interface Lead {
  id: number;
  name?: string;           // Consented Name
  email?: string;          // Consented Email
  company_name_raw?: string; 
  website?: string;
  industry?: string;
  avg_price?: string;
  aura_id: string;         // Forensic Anchor
  created_at: string;
  // Fields merged from the Intelligence Engine
  domain?: string;
  ip_address?: string;
  city?: string;
  region?: string;
  duration?: number;
  url?: string;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically target the backend based on environment
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    fetch(`${API_BASE}/api/v1/leads/`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("🚨 Dashboard Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-sm font-medium text-gray-400 animate-pulse tracking-widest uppercase">
        Initializing Intelligence Feed...
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Internal Lead Ledger</h1>
            <p className="text-sm text-gray-500 mt-1">Forensic B2B traffic and high-intent identity capture.</p>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1">
            System Status: Operational
          </div>
        </header>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entity / Identity</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Firmographics</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Forensics</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Engagement</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Captured At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/80 transition-all duration-200">
                  <td className="px-6 py-5">
                    <div className="font-medium text-gray-900 text-sm">{lead.name || "Anonymous Prospect"}</div>
                    <div className="text-xs text-gray-400 lowercase">{lead.email || "Identity Hidden"}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-gray-800">{lead.company_name_raw || "Unverified Entity"}</div>
                    <div className="text-[11px] text-blue-600 font-medium">{lead.website || lead.domain || "no-domain.io"}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-mono text-gray-500">{lead.ip_address || "0.0.0.0"}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{lead.city}, {lead.region}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${Number(lead.duration) > 60 ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                      <span className="text-xs font-semibold text-gray-700">
                        {lead.duration || 0}s <span className="text-gray-400 font-normal">dwell</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono truncate max-w-[120px]">
                      {lead.industry || "General Industry"}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="text-xs text-gray-600 tabular-nums">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {leads.length === 0 && (
            <div className="py-24 text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
                Awaiting Data Ingress
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}