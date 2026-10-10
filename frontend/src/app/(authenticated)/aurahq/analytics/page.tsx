"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import LinkGenerator from "@/components/LinkGenerator";
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
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
  const { data: session } = useSession();
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
      const userRole = session?.user?.role;
      const userId = session?.user?.id;
      
      let url = `${API_BASE.replace(/\/$/, '')}/api/v1/leads/?client_id=${clientId}`;
      if (userRole !== 'admin' && userId) {
        url += `&sales_rep_id=${userId}`;
      }

      const res = await fetch(url, {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="h-8 w-8 border-2 border-gray-200 dark:border-gray-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Synchronizing Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-6">
        <LinkGenerator />

        {groupedEntities.length > 0 ? (
          viewMode === 'ledger' ? (
            /* --- JURISTIC LEDGER VIEW --- */
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/3/20 shadow-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-white dark:bg-white/3 text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-5 font-bold">Entity Identity</th>
                    <th className="px-6 py-5 font-bold">Jurisdiction / IP</th>
                    <th className="px-6 py-5 font-bold text-center">Signals</th>
                    <th className="px-6 py-5 font-bold text-right">Last Attribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {groupedEntities.map(({ main: lead, totalHits }) => (
                    <tr key={lead.ip_address} className="hover:bg-gray-100 dark:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold border border-gray-300 dark:border-gray-700 group-hover:border-emerald-500/50 transition-colors">
                            {lead.company_name?.charAt(0) || <Globe className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-white/90 group-hover:text-emerald-400 transition-colors leading-none mb-1">
                              {lead.company_name || "Unresolved Juristic Entity"}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono tracking-tighter">
                              {lead.industry || 'Industrial'} • {lead.is_b2b ? 'B2B Locked' : 'General'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-gray-600 dark:text-gray-400 text-xs flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                          {lead.city || 'Hub'}, {lead.country || 'ZAF'}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-1 italic">{lead.ip_address}</div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-emerald-500 text-[10px] font-black uppercase tracking-widest group-hover:bg-emerald-500/10 transition-colors">
                          {totalHits} Events
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right text-gray-400 dark:text-gray-500 tabular-nums text-[11px]">
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
                <div key={lead.ip_address} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/3 transition-all hover:border-gray-300 dark:border-gray-700 shadow-xl overflow-hidden group">
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
                        <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
                            <MapPin className="h-3.5 w-3.5" /> {lead.city || "Hub"}, {lead.country || "ZAF"}
                          </div>
                          <div className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                            {lead.ip_address}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] block mb-1">Capture Epoch</span>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">{new Date(lead.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-4">
                        <MousePointer2 className="h-3 w-3 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Interaction Intelligence</span>
                      </div>
                      {paths.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-white/3 rounded-xl p-4 border border-gray-200 dark:border-gray-800/60 hover:bg-gray-100 dark:bg-gray-800/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <Zap className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-400">{getPathname(p.url)}</span>
                          </div>
                          <div className="flex items-center gap-8 text-right">
                            <div>
                              <div className="text-[8px] uppercase text-gray-400 dark:text-gray-500 font-black tracking-widest">Dwell</div>
                              <div className="text-[11px] font-mono font-bold text-gray-800 dark:text-white/90">{p.duration}s</div>
                            </div>
                            <div>
                              <div className="text-[8px] uppercase text-gray-400 dark:text-gray-500 font-black tracking-widest">Signal</div>
                              <div className="text-[11px] font-mono font-bold text-emerald-500">{p.hits}x</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-gray-50 dark:bg-white/3/60 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
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
          <div className="text-center py-40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/3/10">
            <Activity className="h-10 w-10 text-zinc-800 mb-4 mx-auto" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-gray-500">No Signal Attributed</h3>
          </div>
        )}
      </div>
    </div>
  );
}