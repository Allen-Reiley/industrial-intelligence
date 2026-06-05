"use client";
import { useEffect, useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Activity, 
  RefreshCcw, 
  Search, 
  Download, 
  User, 
  Mail, 
  Network 
} from 'lucide-react';

// Unified Lead interface matching backend SQLModel UUID changes
interface Lead {
  id: string;              // UUID
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/leads/`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error("🚨 Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Leads based on search term
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchStr = `${lead.name || ''} ${lead.email || ''} ${lead.company_name_raw || ''} ${lead.ip_address || ''} ${lead.industry || ''}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [leads, searchTerm]);

  // KPI calculations
  const stats = useMemo(() => {
    const total = leads.length;
    const consentedCount = leads.filter(l => l.name || l.email).length;
    const consentRate = total ? Math.round((consentedCount / total) * 100) : 0;
    const avgDwell = total ? Math.round(leads.reduce((acc, curr) => acc + (curr.duration || 0), 0) / total) : 0;
    return { total, consentedCount, consentRate, avgDwell };
  }, [leads]);

  // Export to CSV helper
  const handleExport = () => {
    if (leads.length === 0) return;
    const headers = ['Identity', 'Email', 'Company', 'Website', 'IP Address', 'Location', 'Dwell Time', 'Industry', 'Captured At'];
    const rows = leads.map(l => [
      l.name || 'Anonymous',
      l.email || 'N/A',
      l.company_name_raw || 'Unverified',
      l.website || l.domain || 'N/A',
      l.ip_address || '0.0.0.0',
      `${l.city || ''}, ${l.region || ''}`,
      `${l.duration || 0}s`,
      l.industry || 'N/A',
      l.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AuraWorks_Lead_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b]">
      <div className="h-8 w-8 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Initializing Lead Ledger...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-zinc-900 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-indigo-400 font-bold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>Security Shield Active</span>
              </div>
              <h1 className="text-lg font-light tracking-tight">Juristic Identity Ledger</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              disabled={leads.length === 0}
              className="p-2 px-3 hover:bg-zinc-900 rounded-lg border border-zinc-800 transition-colors text-xs text-zinc-400 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button onClick={fetchData} className="p-2 hover:bg-zinc-900 rounded-full border border-zinc-800 transition-colors">
              <RefreshCcw className={`h-4 w-4 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="border border-zinc-800/80 rounded-xl p-6 bg-zinc-900/10 backdrop-blur-sm">
            <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Total Leads Captured</div>
            <div className="text-3xl font-light text-zinc-100">{stats.total}</div>
          </div>
          <div className="border border-zinc-800/80 rounded-xl p-6 bg-zinc-900/10 backdrop-blur-sm">
            <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Identified Profiles</div>
            <div className="text-3xl font-light text-zinc-100">{stats.consentedCount}</div>
          </div>
          <div className="border border-zinc-800/80 rounded-xl p-6 bg-zinc-900/10 backdrop-blur-sm">
            <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Consent Conversion</div>
            <div className="text-3xl font-light text-indigo-400">{stats.consentRate}%</div>
          </div>
          <div className="border border-zinc-800/80 rounded-xl p-6 bg-zinc-900/10 backdrop-blur-sm">
            <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Avg Engagement Dwell</div>
            <div className="text-3xl font-light text-zinc-100">{stats.avgDwell}s</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search leads by name, email, company, industry or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/20 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* Lead Table */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20 shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] uppercase tracking-[0.2em] border-b border-zinc-800">
              <tr>
                <th className="px-6 py-5 font-bold">Identity</th>
                <th className="px-6 py-5 font-bold">Entity / Firmographics</th>
                <th className="px-6 py-5 font-bold">Forensics / IP</th>
                <th className="px-6 py-5 font-bold">Engagement</th>
                <th className="px-6 py-5 font-bold text-right">Captured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:border-indigo-500/35 transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-100 group-hover:text-indigo-400 transition-colors leading-none mb-1">
                          {lead.name || "Anonymous Prospect"}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono tracking-tighter flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {lead.email || "Identity Hidden"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="font-medium text-zinc-200">{lead.company_name_raw || "Unverified Entity"}</div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Globe className="h-3 w-3 text-zinc-600" />
                      <a 
                        href={lead.website || `https://${lead.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-indigo-400"
                      >
                        {lead.website || lead.domain || "no-domain.io"}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-zinc-300 text-xs flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-zinc-600" />
                      {lead.city || 'Hub'}, {lead.region || 'ZAF'}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-1">
                      <Network className="h-3 w-3 text-zinc-700" /> {lead.ip_address || "0.0.0.0"}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-zinc-600" />
                      <span className="text-xs font-semibold text-zinc-300">
                        {lead.duration || 0}s <span className="text-zinc-500 font-normal">dwell</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
                      {lead.industry || "General Industry"}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="text-[11px] font-mono font-bold text-zinc-400">
                      {new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">
                      {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <div className="py-24 text-center">
              <Activity className="h-8 w-8 text-zinc-800 mb-3 mx-auto animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">No Captured Leads Found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}