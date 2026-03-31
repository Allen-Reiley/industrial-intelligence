"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Layout, 
  FileText, 
  Settings, 
  BarChart3, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign 
} from "lucide-react";

// Shadcn/UI imports (Ensure these paths match your project structure)
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

// --- Types & Helpers ---
type TabType = 'calculator' | 'logs' | 'settings';

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toLocaleString();
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}K`;
  return `R${n.toLocaleString()}`;
}

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
      active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

// --- Main Page Component ---

export default function AuditDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  // Calculator State
  const [traffic, setTraffic] = useState([5000]);
  const [dealValue, setDealValue] = useState([250000]);
  const [formLeads, setFormLeads] = useState([15]);

  const results = useMemo(() => {
    const t = traffic[0];
    const dv = dealValue[0];
    const fl = formLeads[0];
    const identifiedRate = 0.06;
    const identified = Math.round(t * identifiedRate);
    const missed = Math.max(0, identified - fl);
    const conversionRate = 0.02;
    const annualLeak = Math.round(missed * 12 * conversionRate * dv);
    return { identified, missed, annualLeak };
  }, [traffic, dealValue, formLeads]);

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Revenue Leak Calculator</h2>
              <p className="text-gray-500">Estimate the annual pipeline lost from unidentified traffic.</p>
            </div>

            <Card className="border-border bg-white shadow-xl ring-1 ring-black/5">
              <CardContent className="grid gap-10 md:grid-cols-2 pt-8 p-8">
                {/* Sliders */}
                <div className="flex flex-col gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Monthly Website Traffic</span>
                      <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-mono font-bold">{formatNumber(traffic[0])}</span>
                    </div>
                    <Slider
                      value={traffic}
                      onValueChange={setTraffic}
                      min={500}
                      max={100000}
                      step={500}
                      className="[&_[data-slot=slider-range]]:bg-indigo-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Avg Deal Value (ZAR)</span>
                      <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-mono font-bold">{formatCurrency(dealValue[0])}</span>
                    </div>
                    <Slider
                      value={dealValue}
                      onValueChange={setDealValue}
                      min={10000}
                      max={2000000}
                      step={10000}
                      className="[&_[data-slot=slider-range]]:bg-indigo-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Form Leads / Month</span>
                      <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-mono font-bold">{formLeads[0]}</span>
                    </div>
                    <Slider
                      value={formLeads}
                      onValueChange={setFormLeads}
                      min={0}
                      max={500}
                      step={5}
                      className="[&_[data-slot=slider-range]]:bg-indigo-600"
                    />
                  </div>
                </div>

                {/* Results Visuals */}
                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <TrendingUp size={16} className="text-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Identified</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{results.identified} <span className="text-sm font-normal text-gray-400">/mo</span></div>
                  </div>

                  <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <AlertTriangle size={16} className="text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Missed Ops</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{results.missed} <span className="text-sm font-normal text-gray-400">/mo</span></div>
                  </div>

                  <div className="p-6 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                    <div className="flex items-center gap-2 opacity-80 mb-1">
                      <DollarSign size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Annual Revenue Leak</span>
                    </div>
                    <div className="text-3xl font-bold">{formatCurrency(results.annualLeak)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 'logs':
        return <div className="p-8 bg-white rounded-xl border border-gray-100 text-gray-400 text-center">Audit Logs would appear here.</div>;
      case 'settings':
        return <div className="p-8 bg-white rounded-xl border border-gray-100 text-gray-400 text-center">Configuration settings.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/50 text-gray-900">
      {/* Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-indigo-100 shadow-lg">
            <BarChart3 className="text-white" size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">NexusAudit</span>
        </div>

        <nav className="space-y-2">
          <SidebarItem icon={TrendingUp} label="Leak Calculator" active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} />
          <SidebarItem icon={FileText} label="System Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <SidebarItem icon={Settings} label="Audit Config" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Admin User</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200"><User size={16} /></div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}