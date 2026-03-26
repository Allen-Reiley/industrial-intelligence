"use client";
import { useEffect, useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  Activity,
  RefreshCcw,
  MousePointer2,
  ChevronRight
} from 'lucide-react';

// --- Types ---
interface Lead {
  id: number;
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
  hit_count?: number; // Added for the new backend logic
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    return "https://dynamic-flow-production-a5d6.up.railway.app";
  };

  // Logic to group individual pings into unique Corporate Entities
  const groupedLeads = useMemo(() => {
    const groups: Record<string, { main: Lead, paths: { url: string, duration: number, hits: number }[] }> = {};
    
    leads.forEach(lead => {
      const key = lead.ip_address;
      if (!groups[key]) {
        groups[key] = { main: lead, paths: [] };
      }
      
      // Track unique paths visited by this IP
      const pathIndex = groups[key].paths.findIndex(p => p.url === lead.url);
      if (pathIndex > -1) {
        groups[key].paths[pathIndex].duration += (lead.duration || 0);
        groups[key].paths[pathIndex].hits += (lead.hit_count || 1);
      } else {
        groups[key].paths.push({ 
          url: lead.url || "/", 
          duration: lead.duration || 0, 
          hits: lead.hit_count || 1 
        });
      }
    });
    
    return Object.values(groups).sort((a, b) => 
      new Date(b.main.created_at).getTime() - new Date(a.main.created_at).getTime()
    );
  }, [leads]);

  const fetchData = async () => {
    setIsRefreshing(true);
    const BASE_URL = getApiUrl().replace(/\/$/, '');
    try {
      const res = await fetch(`${BASE_URL}/api/v1/leads`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("AuraWorks Identity Bridge Connection failed:", err);
      setLeads([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPathname = (urlStr: string | null) => {
    if (!urlStr) return "/";
    try {
      const urlObj = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return urlObj.pathname;
    } catch (e) { return urlStr; }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
      {/* Top Navigation */}
      <div className="border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 shadow-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase">Intelligence Feed</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Identity Aggregator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={fetchData} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                <RefreshCcw className={`h-4 w-4 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
             </button>
             <div className="rounded-full border border-zinc-200 dark:border-zinc-800 px-4 py-1.5 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 shadow-sm">
                {groupedLeads.length} Entities Resolved
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="grid gap-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="h-8 w-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Resolving Industrial Signatures...</p>
            </div>
          ) : groupedLeads.length > 0 ? (
            groupedLeads.map(({ main: lead, paths }) => (
              <div key={lead.ip_address} className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm">
                
                <div className="p-6 md:p-8">
                    {/* Header: Identity & IP */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                            {lead.company_name || "Unresolved Juristic Entity"}
                        </h2>
                        {lead.is_b2b && (
                            <div className="flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                            <ShieldCheck className="h-3 w-3" /> Juristic
                            </div>
                        )}
                        </div>
                        <div className="flex items-center gap-4 text-zinc-500">
                            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
                                <MapPin className="h-3.5 w-3.5" /> {lead.city || "Hub"}, {lead.country || "ZAF"}
                            </div>
                            <div className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded italic">
                                {lead.ip_address}
                            </div>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-widest block">Last Active</span>
                        <p className="text-[11px] font-bold">{new Date(lead.created_at).toLocaleString()}</p>
                    </div>
                    </div>

                    {/* Page Interaction Feed */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                            <MousePointer2 className="h-3 w-3 text-zinc-400" />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Interaction Intelligence</span>
                        </div>
                        <div className="grid gap-2">
                            {paths.map((p, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800/60">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                            <Zap className="h-3 w-3 text-emerald-500" />
                                        </div>
                                        <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                            {getPathname(p.url)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] uppercase text-zinc-400 font-bold">Dwell Time</span>
                                            <span className="text-[10px] font-mono font-black">{p.duration}s</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] uppercase text-zinc-400 font-bold">Signal</span>
                                            <span className="text-[10px] font-mono font-black text-emerald-500">{p.hits}x</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Attribution */}
                <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-zinc-400" />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter truncate max-w-[200px]">
                            Via: {lead.referrer || "Direct Link"}
                        </span>
                    </div>
                    <button className="text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1">
                        Trace Source <ChevronRight className="h-3 w-3" />
                    </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <Activity className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-4 mx-auto" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">No Resolved Traffic</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}