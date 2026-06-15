"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Zap,
  Activity,
  RefreshCcw,
  MousePointer2,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';

// --- DATA CONTRACTS ---
interface Client {
  id: string;
  company_name: string;
  domain?: string;
  whitelisted_domains: string[];
  subscription_status: 'trial' | 'active' | 'suspended';
  require_consent_banner: boolean;
  collect_personal_data: boolean;
  is_active: boolean;
}

interface Lead {
  id: string;
  company_name: string | null;
  is_b2b: boolean;
  industry: string | null;
  ip_address: string;
  city: string | null;
  region: string | null;
  country: string | null;
  duration: number | null;
  url: string | null;
  referrer: string | null;
  created_at: string;
  hit_count?: number;
}

interface GroupedEntity {
  main: Lead;
  totalHits: number;
  totalDuration: number;
  paths: { url: string; duration: number; hits: number }[];
}

export default function UnifiedDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'ledger'>('ledger');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dynamic-flow-production-a5d6.up.railway.app";

  // --- IDENTITY BRIDGE LOGIC ---
  const groupedEntities = useMemo(() => {
    const groups: Record<string, GroupedEntity> = {};
    
    leads.forEach(lead => {
      const key = lead.ip_address;
      if (!groups[key]) {
        groups[key] = { main: lead, totalHits: 0, totalDuration: 0, paths: [] };
      }
      
      const pathIndex = groups[key].paths.findIndex(p => p.url === lead.url);
      const currentHits = lead.hit_count || 1;
      const currentDuration = lead.duration || 0;

      groups[key].totalHits += currentHits;
      groups[key].totalDuration += currentDuration;

      if (pathIndex > -1) {
        groups[key].paths[pathIndex].duration += currentDuration;
        groups[key].paths[pathIndex].hits += currentHits;
      } else {
        groups[key].paths.push({ 
          url: lead.url || "/", 
          duration: currentDuration, 
          hits: currentHits 
        });
      }
    });
    
    return Object.values(groups).sort((a, b) => 
      new Date(b.main.created_at).getTime() - new Date(a.main.created_at).getTime()
    );
  }, [leads]);

  const fetchClients = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/`, {
        headers,
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
        if (data.length > 0) {
          setActiveClient(data[0]);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("AuraWorks Clients Retrieval Failure:", err);
      setLoading(false);
    }
  };

  const fetchData = async (clientId: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/leads/?client_id=${clientId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("AuraWorks Identity Bridge Failure:", err);
      setLeads([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (activeClient) {
      fetchData(activeClient.id);
      const interval = setInterval(() => fetchData(activeClient.id), 60000);
      return () => clearInterval(interval);
    }
  }, [activeClient]);

  const getPathname = (urlStr: string | null) => {
    if (!urlStr) return "/";
    try {
      const urlObj = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return urlObj.pathname;
    } catch (e) { return urlStr; }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b]">
      <div className="h-8 w-8 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Synchronizing Intelligence...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 font-sans selection:bg-emerald-500/30">
      {/* --- REFINED NAV BAR --- */}
      <nav className="border-b border-zinc-900 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Activity className="h-5 w-5" />
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-emerald-500 font-bold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Signal Ledger</span>
              </div>
              <h1 className="text-lg font-light tracking-tight">Intelligence Dashboard</h1>
            </div>
          </div>

          {/* Navigation Switcher */}
          <div className="flex items-center bg-zinc-950/60 border border-zinc-850 rounded-lg p-1 text-xs">
            <div className="relative group">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-2xl z-50 text-center leading-normal">
                <p className="font-bold text-zinc-200 mb-0.5">Intelligence Dashboard</p>
                Real-time visitor telemetry, geolocation mapping, and live traffic analytics.
              </div>
            </div>
            
            <div className="relative group">
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Admin Ledger</span>
              </Link>
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-2xl z-50 text-center leading-normal">
                <p className="font-bold text-zinc-200 mb-0.5">Juristic Identity Ledger</p>
                B2B consent records, enterprise identity resolution, and CSV lead exporter.
              </div>
            </div>
          </div>

          {/* Client Switcher (Visible if multiple clients are present, e.g. superuser) */}
          {clients.length > 0 && activeClient && (
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Client:</span>
              <select 
                value={activeClient.id} 
                onChange={(e) => {
                  const client = clients.find(c => c.id === e.target.value);
                  if (client) setActiveClient(client);
                }}
                className="bg-transparent border-none text-xs text-zinc-300 font-bold focus:ring-0 cursor-pointer max-w-[180px] outline-none"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-zinc-950 text-zinc-300 font-bold">{c.company_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-900 rounded-lg p-1 mr-4 border border-zinc-800">
              <button 
                onClick={() => setViewMode('ledger')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'ledger' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'cards' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <button 
              onClick={() => activeClient && fetchData(activeClient.id)} 
              className="p-2 hover:bg-zinc-900 rounded-full border border-zinc-800 transition-colors"
            >
              <RefreshCcw className={`h-4 w-4 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {groupedEntities.length > 0 ? (
          viewMode === 'ledger' ? (
            /* --- JURISTIC LEDGER VIEW --- */
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20 shadow-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] uppercase tracking-[0.2em] border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-5 font-bold">Entity Identity</th>
                    <th className="px-6 py-5 font-bold">Jurisdiction / IP</th>
                    <th className="px-6 py-5 font-bold text-center">Signals</th>
                    <th className="px-6 py-5 font-bold text-right">Last Attribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {groupedEntities.map(({ main: lead, totalHits }) => (
                    <tr key={lead.ip_address} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold border border-zinc-700 group-hover:border-emerald-500/50 transition-colors">
                            {lead.company_name?.charAt(0) || <Globe className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors leading-none mb-1">
                              {lead.company_name || "Unresolved Juristic Entity"}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono tracking-tighter">
                              {lead.industry || 'Industrial'} • {lead.is_b2b ? 'B2B Locked' : 'General'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-zinc-300 text-xs flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-zinc-600" />
                          {lead.city || 'Hub'}, {lead.country || 'ZAF'}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1 italic">{lead.ip_address}</div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-emerald-500 text-[10px] font-black uppercase tracking-widest group-hover:bg-emerald-500/10 transition-colors">
                          {totalHits} Events
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right text-zinc-500 tabular-nums text-[11px]">
                        {new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* --- FORENSIC CARD VIEW --- */
            <div className="grid gap-8 max-w-5xl mx-auto">
              {groupedEntities.map(({ main: lead, paths, totalHits }) => (
                <div key={lead.ip_address} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 transition-all hover:border-zinc-700 shadow-xl overflow-hidden group">
                  <div className="p-8">
                    <div className="flex justify-between items-start gap-4 mb-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                            {lead.company_name || "Unresolved Juristic Entity"}
                          </h2>
                          {lead.is_b2b && (
                            <div className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20">
                              <ShieldCheck className="h-3 w-3" /> Juristic
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-zinc-500">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
                            <MapPin className="h-3.5 w-3.5" /> {lead.city || "Hub"}, {lead.country || "ZAF"}
                          </div>
                          <div className="font-mono text-[10px] bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-400">
                            {lead.ip_address}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em] block mb-1">Capture Epoch</span>
                        <p className="text-[11px] font-bold text-zinc-400 tabular-nums">{new Date(lead.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-4">
                        <MousePointer2 className="h-3 w-3 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Interaction Intelligence</span>
                      </div>
                      {paths.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-zinc-800/40 rounded-xl p-4 border border-zinc-800/60 hover:bg-zinc-800/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <Zap className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs font-mono font-bold text-zinc-300">{getPathname(p.url)}</span>
                          </div>
                          <div className="flex items-center gap-8 text-right">
                            <div>
                              <div className="text-[8px] uppercase text-zinc-600 font-black tracking-widest">Dwell</div>
                              <div className="text-[11px] font-mono font-bold text-zinc-100">{p.duration}s</div>
                            </div>
                            <div>
                              <div className="text-[8px] uppercase text-zinc-600 font-black tracking-widest">Signal</div>
                              <div className="text-[11px] font-mono font-bold text-emerald-500">{p.hits}x</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-zinc-900/60 border-t border-zinc-800 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center gap-2 italic">Ref: {lead.referrer || "Direct Ingress"}</span>
                    <button className="flex items-center gap-1 hover:text-emerald-500 transition-colors group/btn">
                      Trace Source <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-40 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/10">
            <Activity className="h-10 w-10 text-zinc-800 mb-4 mx-auto" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">No Signal Attributed</h3>
          </div>
        )}
      </div>
    </div>
  );
}