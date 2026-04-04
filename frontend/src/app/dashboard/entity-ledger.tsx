'use client';

import React, { useEffect, useState } from 'react';

interface Company {
  id: number;
  name: string;
  domain: string;
  industry: string;
  city: string;
  total_visits: number;
  created_at: string;
}

const EntityLedger = () => {
  const [entities, setEntities] = useState<Company[]>([]);

  useEffect(() => {
    const fetchEntities = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/debug/entities`);
      const data = await res.json();
      setEntities(data);
    };
    fetchEntities();
  }, []);

  return (
    <div className="bg-[#09090b] min-h-screen p-12 font-sans text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="space-y-2">
          <div className="flex items-center space-x-2 text-[10px] tracking-[0.3em] text-emerald-500 font-bold uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Identity Ledger</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Juristic Entities</h1>
        </header>

        <div className="border border-slate-800/60 rounded-lg overflow-hidden bg-[#0c0c0e]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-800/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Entity Name</th>
                <th className="px-6 py-4 font-semibold">Jurisdiction</th>
                <th className="px-6 py-4 font-semibold text-center">Engagement</th>
                <th className="px-6 py-4 font-semibold text-right">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {entities.map((company) => (
                <tr key={company.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-medium text-slate-100 group-hover:text-white">{company.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{company.domain}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-slate-300">{company.industry || 'Industrial'}</div>
                    <div className="text-[11px] text-slate-500">{company.city}, ZA</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                      {company.total_visits} SESSIONS
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right text-slate-500 tabular-nums text-xs">
                    {new Date(company.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EntityLedger;