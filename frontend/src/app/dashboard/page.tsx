"use client";
import { useEffect, useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  Activity,
  RefreshCcw
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
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Dynamic API Resolution ---
  const getApiUrl = () => {
    // Priority 1: Environment Variable (Defined in Vercel/Railway)
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    
    // Priority 2: Production Railway URL
    return "https://dynamic-flow-production-a5d6.up.railway.app";
  };

  const fetchData = async () => {
    setIsRefreshing(true);
    const BASE_URL = getApiUrl().replace(/\/$/, '');
    
    try {
      // Endpoint matches your FastAPI router: /api/v1/leads
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
    // Auto-refresh every 60 seconds to keep the "Intelligence Feed" live
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getUrlInfo = (urlStr: string | null, type: 'host' | 'path') => {
    if (!urlStr || urlStr === "direct" || urlStr === "Direct") {
      return type === 'host' ? "Direct Traffic" : "/";
    }
    try {
      const fullUrl = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
      const urlObj = new URL(fullUrl);
      return type === 'host' ? urlObj.hostname : urlObj.pathname;
    } catch (e) { return urlStr; }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
      {/* Top Navigation / Status Bar */}
      <div className="border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 shadow-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase">Intelligence Feed</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">AuraWorks Identity Bridge</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={fetchData}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
                title="Manual Sync"
             >
                <RefreshCcw className={`h-4 w-4 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
             </button>
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-tighter">System Engine</span>
                <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
             </div>
             <div className="rounded-full border border-zinc-200 dark:border-zinc-800 px-4 py-1.5 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 shadow-sm">
                {leads.length} Entities Resolved
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="grid gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="h-8 w-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Parsing PostgreSQL Data...</p>
            </div>
          ) : leads.length > 0 ? (
            leads.map((lead) => (
              <div key={lead.id} className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 md:p-8 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                        {lead.company_name || "Unresolved Juristic Entity"}
                      </h2>
                      {lead.is_b2b && (
                        <div className="flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          <ShieldCheck className="h-3 w-3" /> Juristic
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                       <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                        {lead.industry || "General Industrial"}
                      </div>
                      <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                        UID: {lead.id}
                      </div>
                    </div>
                  </div>

                  <div className="text-left md:text-right flex flex-col items-start md:items-end gap-1">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-widest">Captured (SAST)</span>
                    <p className="text-[11px] font-bold">{new Date(lead.created_at).toLocaleString()}</p>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded italic">{lead.ip_address}</p>
                  </div>
                </div>

                {/* Technical Specs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 pt-8 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                  {/* Column 1: Firmographic Locality */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <MapPin className="h-3 w-3" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Resolution Point</span>
                    </div>
                    <p className="font-semibold text-sm">
                      {lead.city ? `${lead.city}, ${lead.region}` : "Region Unresolved"}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{lead.country || "ZAF"}</p>
                  </div>
                  
                  {/* Column 2: Intent Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Engagement Dwell</span>
                    </div>
                    <p className="font-semibold text-sm">
                      {lead.duration ? `${lead.duration}s Session` : "Active / Live"}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                      <Zap className="h-3 w-3 text-emerald-500" />
                      <span className="truncate max-w-[150px] italic">{getUrlInfo(lead.url, 'path')}</span>
                    </div>
                  </div>

                  {/* Column 3: Attribution */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Globe className="h-3 w-3" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Traffic Origin</span>
                    </div>
                    <p className="font-semibold text-sm truncate">
                      {getUrlInfo(lead.referrer, 'host')}
                    </p>
                    <button className="group/btn text-[9px] uppercase font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                      Trace Referrer <ExternalLink className="h-2 w-2 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/20">
              <Activity className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">No Resolved Traffic</h3>
              <p className="text-[11px] text-zinc-400 max-w-[200px] mx-auto mt-2 leading-relaxed uppercase tracking-tighter">
                Identity Bridge is listening for juristic signatures. 
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}