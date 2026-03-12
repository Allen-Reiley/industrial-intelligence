"use client";
import { useEffect, useState } from 'react';

// Define the shape of our Lead based on the Backend Model
interface Lead {
  id: number;
  company_name: string;
  domain: string;
  ip_address: string;
  city: string;
  region: string;
  duration: number;
  url: string;
  hq_phone: string | null;
  corp_emails: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calling our new FastAPI endpoint
    fetch('http://localhost:8000/api/v1/leads')
      .then((res) => res.json())
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching leads:", err));
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Lead Intelligence...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Internal Lead Feed</h1>
          <p className="text-gray-500">Real-time B2B traffic and firmographic data.</p>
        </header>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company / Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{lead.company_name || "Unknown"}</div>
                    <div className="text-sm text-blue-500">{lead.domain}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{lead.city}</div>
                    <div className="text-xs text-gray-500">{lead.region}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {lead.ip_address}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.duration > 30 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {lead.duration}s on site
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1 truncate max-w-[150px]">{lead.url}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-gray-900">{lead.hq_phone || "No Phone"}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{lead.corp_emails || "Fetching emails..."}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="p-20 text-center text-gray-400">No B2B leads captured yet. Keep the tracker running!</div>
          )}
        </div>
      </div>
    </div>
  );
}