"use client";
import { useEffect, useState } from 'react';

// Define a proper interface for our Lead data
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

  useEffect(() => {
    fetch('http://localhost:8000/v1/leads') 
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLeads(data);
        } else {
          console.error("Backend sent an object instead of a list:", data);
          setLeads([]); 
        }
      })
      .catch(err => {
        console.error("Failed to connect to backend:", err);
        setLeads([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper function to safely parse Hostnames/Pathnames from messy data
  const getUrlInfo = (urlStr: string | null, type: 'host' | 'path') => {
    if (!urlStr || urlStr === "Direct") return type === 'host' ? "Direct Traffic" : "/";
    try {
      // Ensure string starts with protocol for the URL constructor
      const fullUrl = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
      const urlObj = new URL(fullUrl);
      return type === 'host' ? urlObj.hostname : urlObj.pathname;
    } catch (e) {
      return urlStr; // Fallback to raw string if parsing fails
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">AuraWorks Live Feed</h1>
            <p className="text-gray-500 mt-1">Real-time B2B visitor intelligence</p>
          </div>
          <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
            {leads.length} Active Leads
          </span>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500 animate-pulse">Loading intelligence feed...</p>
            </div>
          ) : leads.length > 0 ? (
            leads.map((lead) => (
              <div key={lead.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-blue-600 mb-1">
                      {lead.company_name || "Unknown Company"}
                    </h2>
                    <div className="flex gap-2 mb-4">
                      {lead.is_b2b ? (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-black tracking-tighter">B2B Lead</span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-black tracking-tighter">General Traffic</span>
                      )}
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase font-black tracking-tighter">
                        {lead.industry || "Researching"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400 font-mono">
                    <p>{new Date(lead.created_at).toLocaleString()}</p>
                    <p className="mt-1 text-gray-500">{lead.ip_address}</p>
                  </div>
                </div>

                <hr className="my-4 border-gray-100" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  {/* Column 1: Location */}
                  <div>
                    <p className="text-gray-400 uppercase text-[10px] font-bold tracking-widest mb-1">Location</p>
                    <p className="text-gray-700 font-semibold italic">
                      {lead.city ? `${lead.city}, ${lead.region}` : "Locating..."}
                    </p>
                    <p className="text-gray-500">{lead.country || "---"}</p>
                  </div>
                  
                  {/* Column 2: Engagement */}
                  <div>
                    <p className="text-gray-400 uppercase text-[10px] font-bold tracking-widest mb-1">Engagement</p>
                    <p className="text-gray-700 font-semibold">
                      {lead.duration ? `${lead.duration} seconds` : "Session Live"}
                    </p>
                    <p className="text-gray-500 truncate max-w-[200px]" title={lead.url || ""}>
                      {getUrlInfo(lead.url, 'path')}
                    </p>
                  </div>

                  {/* Column 3: Traffic Source */}
                  <div>
                    <p className="text-gray-400 uppercase text-[10px] font-bold tracking-widest mb-1">Source</p>
                    <p className="text-gray-700 font-semibold truncate">
                      {getUrlInfo(lead.referrer, 'host')}
                    </p>
                    <p className="text-xs text-gray-400">Referrer Path</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-400 text-lg">No visitor data found yet.</p>
              <p className="text-gray-400 text-sm mt-2">Try visiting your site from a new tab to trigger a lead.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}