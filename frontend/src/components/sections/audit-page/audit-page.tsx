"use client";

import React, { useState } from 'react';
import { Layout, FileText, Settings, BarChart3, User } from 'lucide-react';

// --- Types for better DX ---
type TabType = 'overview' | 'documents' | 'settings';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

// --- Sub-Components ---

const Header = ({ title }: { title: string }) => (
  <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
        <User size={20} />
      </div>
    </div>
  </header>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

// --- Exported Main Component ---

export default function AuditDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Total Audits', 'Pending Review', 'Completed'].map((stat) => (
                <div key={stat} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wider">{stat}</p>
                  <p className="text-3xl font-bold mt-2">24</p>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex flex-col items-center justify-center text-gray-400 border-dashed border-2">
              <BarChart3 size={48} className="mb-2 opacity-20" />
              <p>Audit Analytics Visualization</p>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Audit Log</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Timestamp</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium">System_Audit_Log_00{i}</td>
                    <td className="px-6 py-4 text-gray-500">March {i + 20}, 2026</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6">Audit Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Email</label>
                <input type="email" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="admin@nexuscore.com" />
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">Update Preferences</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
        <div className="flex items-center space-x-2 px-4 mb-8">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Layout className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            NexusAudit
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={BarChart3} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={FileText} label="Logs" active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}