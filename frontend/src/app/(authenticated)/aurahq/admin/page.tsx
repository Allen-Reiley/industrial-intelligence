
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Globe, Activity, RefreshCcw, Search, Download, 
  User, Mail, Plus, Code, Check, AlertTriangle, LogOut, Sliders, Database,
  CreditCard, DollarSign, Save, Trash2, Settings, Palette, Users
} from 'lucide-react';

interface Client {
  id: string;
  company_name: string;
  contact_email?: string;
  domain?: string;
  whitelisted_domains: string[];
  subscription_status: 'trial' | 'active' | 'suspended' | 'cancellation_pending';
  payment_plan: string;
  require_consent_banner: boolean;
  collect_personal_data: boolean;
  is_active: boolean;
  payment_method_token?: string;
  custom_monthly_amount?: number;
  theme_config?: any;
  created_at: string;
}

interface Lead {
  id: string;
  name?: string;
  email?: string;
  position?: string;
  department?: string;
  aura_id: string;
  created_at: string;
  is_warm: boolean;
  company?: {
    name: string;
    domain?: string;
    industry?: string;
    total_visits: number;
    is_verified: boolean;
  };
}

export default function AdminDashboard() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status filter tab
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended' | 'cancellation_pending'>('all');
  
  // Detail View Tab
  const [detailTab, setDetailTab] = useState<'overview' | 'settings' | 'billing' | 'theming'>('overview');

  // Form states (Settings)
  const [contactEmail, setContactEmail] = useState('');
  const [whitelistedDomains, setWhitelistedDomains] = useState('');
  const [requireConsent, setRequireConsent] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Billing states
  const [paymentPlan, setPaymentPlan] = useState('monthly');
  const [monthlyAmountInput, setMonthlyAmountInput] = useState<string>('10000');
  const [isSavingBilling, setIsSavingBilling] = useState(false);

  // Theme states
  const [themeLightBg, setThemeLightBg] = useState('#ffffff');
  const [themeLightText, setThemeLightText] = useState('#111827');
  const [themeLightPrimary, setThemeLightPrimary] = useState('#10b981');
  const [themeDarkBg, setThemeDarkBg] = useState('#111827');
  const [themeDarkText, setThemeDarkText] = useState('#ffffff');
  const [themeDarkPrimary, setThemeDarkPrimary] = useState('#10b981');
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // General app state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [newCompanyName, setNewCompanyName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newWhitelistedDomains, setNewWhitelistedDomains] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const logout = () => {
    document.cookie = 'admin_access_token=; path=/; max-age=0;';
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/login');
  };

  const fetchClients = async (selectDefaultId?: string) => {
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/`, { credentials: 'include' });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error('Failed to retrieve clients list.');
      const data = await res.json();
      setClients(data);
      if (data.length > 0) {
        const nextSelected = selectDefaultId ? data.find((c: Client) => c.id === selectDefaultId) || data[0] : data[0];
        setSelectedClient(nextSelected);
      }
    } catch (err) {
      console.error("🚨 Clients Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async (clientId: string) => {
    setLeadsLoading(true);
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/leads/?client_id=${clientId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to retrieve client leads.');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchLeads(selectedClient.id);
      
      // Populate states
      setContactEmail(selectedClient.contact_email || '');
      setWhitelistedDomains(selectedClient.whitelisted_domains.join(', '));
      setRequireConsent(selectedClient.require_consent_banner);
      setPaymentPlan(selectedClient.payment_plan || 'monthly');
      
      const amountInRands = selectedClient.custom_monthly_amount != null 
        ? (selectedClient.custom_monthly_amount / 100).toString() 
        : '10000';
      setMonthlyAmountInput(amountInRands);

      const tc = selectedClient.theme_config;
      setThemeLightBg(tc?.light?.bg || '#ffffff');
      setThemeLightText(tc?.light?.text || '#111827');
      setThemeLightPrimary(tc?.light?.primary || '#10b981');
      setThemeDarkBg(tc?.dark?.bg || '#111827');
      setThemeDarkText(tc?.dark?.text || '#ffffff');
      setThemeDarkPrimary(tc?.dark?.primary || '#10b981');
    }
  }, [selectedClient]);

  const handleUpdateSettings = async () => {
    if (!selectedClient) return;
    setIsSavingSettings(true);
    try {
      const domainsArray = whitelistedDomains.split(',').map(d => d.trim()).filter(d => d.length > 0);
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/${selectedClient.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_email: contactEmail,
          whitelisted_domains: domainsArray,
          require_consent_banner: requireConsent
        })
      });
      if (!res.ok) throw new Error('Failed to update settings');
      const updatedClient = await res.json();
      setClients(prev => prev.map(c => c.id === updatedClient.id ? { ...c, ...updatedClient } : c));
      setSelectedClient(updatedClient);
      alert('Settings updated successfully');
    } catch (err) {
      alert('Error updating settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUpdateBilling = async () => {
    if (!selectedClient) return;
    setIsSavingBilling(true);
    const parsedAmount = parseFloat(monthlyAmountInput);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert('Invalid amount. Enter a positive number.');
      setIsSavingBilling(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/${selectedClient.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_monthly_amount: Math.round(parsedAmount * 100),
          payment_plan: paymentPlan
        })
      });
      if (!res.ok) throw new Error('Failed to update billing');
      const updatedClient = await res.json();
      setClients(prev => prev.map(c => c.id === updatedClient.id ? { ...c, ...updatedClient } : c));
      setSelectedClient(updatedClient);
      alert('Billing updated successfully');
    } catch (err) {
      alert('Error updating billing');
    } finally {
      setIsSavingBilling(false);
    }
  };

  const handleUpdateTheme = async () => {
    if (!selectedClient) return;
    setIsSavingTheme(true);
    const theme_config = {
      light: { bg: themeLightBg, text: themeLightText, primary: themeLightPrimary },
      dark: { bg: themeDarkBg, text: themeDarkText, primary: themeDarkPrimary }
    };
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/${selectedClient.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_config })
      });
      if (!res.ok) throw new Error('Failed to update theme');
      const updatedClient = await res.json();
      setClients(prev => prev.map(c => c.id === updatedClient.id ? { ...c, ...updatedClient } : c));
      setSelectedClient(updatedClient);
      alert('Theme updated successfully');
    } catch (err) {
      alert('Error updating theme');
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete ${selectedClient.company_name}? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/${selectedClient.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete client');
      
      setClients(prev => prev.filter(c => c.id !== selectedClient.id));
      setSelectedClient(null);
      alert('Client deleted successfully');
    } catch (err) {
      alert('Error deleting client');
    }
  };

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const domainsArray = newWhitelistedDomains.split(',').map(d => d.trim()).filter(d => d.length > 0);
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: newCompanyName,
          contact_email: newContactEmail,
          whitelisted_domains: domainsArray,
          require_consent_banner: false,
          subscription_status: 'trial',
          is_active: true
        })
      });
      if (!res.ok) throw new Error('Failed to register client');
      const registered = await res.json();
      setShowRegisterModal(false);
      setNewCompanyName(''); setNewContactEmail(''); setNewWhitelistedDomains('');
      await fetchClients(registered.id);
    } catch (err) {
      alert('Error registering client');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    if (statusFilter === 'all') return clients;
    return clients.filter(c => c.subscription_status === statusFilter);
  }, [clients, statusFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchStr = `${lead.name || ''} ${lead.email || ''} ${lead.position || ''}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [leads, searchTerm]);
  
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
      <div className="h-8 w-8 border-2 border-zinc-900 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Loading Console...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-indigo-400" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-300">Admin Control Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="h-8 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Plus className="h-3 w-3" /> New Client
            </button>
            <button onClick={logout} className="p-2 hover:bg-zinc-900 rounded border border-zinc-850 text-zinc-500">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Clients List */}
        <div className="w-80 border-r border-zinc-900 bg-zinc-950/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-900">
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
              {(['all', 'active', 'trial', 'suspended', 'cancellation_pending'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    statusFilter === status 
                      ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' 
                      : 'bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800 border border-transparent'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Clients ({filteredClients.length})</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredClients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left p-4 border-b border-zinc-900 transition-colors ${
                  selectedClient?.id === client.id ? 'bg-zinc-900 border-l-2 border-l-indigo-500' : 'hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-zinc-200">{client.company_name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    client.subscription_status === 'active' ? 'bg-green-500/10 text-green-400' :
                    client.subscription_status === 'trial' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {client.subscription_status}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 truncate">{client.whitelisted_domains[0] || 'No domain'}</div>
              </button>
            ))}
            {filteredClients.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-xs">No clients found for this filter.</div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-zinc-950">
          {selectedClient ? (
            <div className="p-8 max-w-5xl mx-auto">
              {/* Header Info */}
              <div className="flex justify-between items-end mb-8 pb-6 border-b border-zinc-900">
                <div>
                  <h2 className="text-3xl font-light text-zinc-100 mb-2">{selectedClient.company_name}</h2>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> {selectedClient.whitelisted_domains.join(', ')}</span>
                    {selectedClient.contact_email && (
                      <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {selectedClient.contact_email}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowSnippetModal(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 font-medium flex items-center gap-2 transition-colors"
                >
                  <Code className="h-4 w-4" /> View Script Tag
                </button>
              </div>

              {/* Detail Tabs */}
              <div className="flex gap-2 mb-8 border-b border-zinc-900 pb-px">
                {[
                  { id: 'overview', icon: Users, label: 'Leads & Overview' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                  { id: 'billing', icon: CreditCard, label: 'Billing' },
                  { id: 'theming', icon: Palette, label: 'Theme Config' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      detailTab === t.id 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <t.icon className="h-4 w-4" /> {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="min-h-[500px]">
                {/* OVERVIEW TAB */}
                {detailTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input 
                          type="text" 
                          placeholder="Search leads..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded border border-zinc-800 bg-zinc-900/50 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/20">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase border-b border-zinc-800">
                          <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">Email</th>
                            <th className="px-6 py-3 font-medium">Company</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {filteredLeads.map(lead => (
                            <tr key={lead.id} className="hover:bg-zinc-900/40">
                              <td className="px-6 py-4 text-zinc-200">{lead.name || 'Anonymous'}</td>
                              <td className="px-6 py-4 text-zinc-400">{lead.email || 'N/A'}</td>
                              <td className="px-6 py-4 text-zinc-300">{lead.company?.name || 'Unknown'}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${lead.is_warm ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                  {lead.is_warm ? 'Warm' : 'Silent'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredLeads.length === 0 && (
                        <div className="py-12 text-center text-zinc-500 text-sm">No leads match your criteria.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* SETTINGS TAB */}
                {detailTab === 'settings' && (
                  <div className="max-w-2xl space-y-6">
                    <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-xl space-y-5">
                      <h3 className="text-sm font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">Client Preferences</h3>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Contact / Report Email</label>
                        <input 
                          type="email" 
                          value={contactEmail} 
                          onChange={e => setContactEmail(e.target.value)} 
                          className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-zinc-500 mt-1">Where automated reports and notifications will be sent.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Whitelisted Domains (comma separated)</label>
                        <input 
                          type="text" 
                          value={whitelistedDomains} 
                          onChange={e => setWhitelistedDomains(e.target.value)} 
                          className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <input 
                          type="checkbox" 
                          id="consentToggle"
                          checked={requireConsent} 
                          onChange={e => setRequireConsent(e.target.checked)} 
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-950"
                        />
                        <label htmlFor="consentToggle" className="text-sm text-zinc-300">Require Consent Banner (GDPR/POPIA)</label>
                      </div>

                      <div className="pt-4 border-t border-zinc-800">
                        <button 
                          onClick={handleUpdateSettings} 
                          disabled={isSavingSettings}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" /> Save Settings
                        </button>
                      </div>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="p-6 border border-red-900/30 bg-red-950/10 rounded-xl space-y-4 mt-12">
                      <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Danger Zone</h3>
                      </div>
                      <p className="text-xs text-zinc-400">Permanently delete this client and all associated telemetry data. This action cannot be undone.</p>
                      <button 
                        onClick={handleDeleteClient}
                        className="px-4 py-2 bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white border border-red-800 hover:border-red-600 rounded text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> Delete Client Profile
                      </button>
                    </div>
                  </div>
                )}

                {/* BILLING TAB */}
                {detailTab === 'billing' && (
                  <div className="max-w-2xl space-y-6">
                    <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-xl space-y-5">
                      <h3 className="text-sm font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">Billing Configuration</h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Payment Plan</label>
                          <select 
                            value={paymentPlan}
                            onChange={(e) => setPaymentPlan(e.target.value)}
                            className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="monthly">Monthly Subscription</option>
                            <option value="annual">Annual Subscription</option>
                            <option value="enterprise">Enterprise Custom</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Custom Fee Amount (ZAR)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input 
                              type="number" 
                              value={monthlyAmountInput}
                              onChange={(e) => setMonthlyAmountInput(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-800">
                        <button 
                          onClick={handleUpdateBilling} 
                          disabled={isSavingBilling}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" /> Update Billing
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* THEMING TAB */}
                {detailTab === 'theming' && (
                  <div className="max-w-3xl space-y-6">
                    <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-xl space-y-5">
                      <h3 className="text-sm font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">Widget Appearance</h3>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Light Theme */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Light Mode</h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-zinc-300">Background</label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-mono">{themeLightBg}</span>
                                <input type="color" value={themeLightBg} onChange={e=>setThemeLightBg(e.target.value)} className="h-8 w-12 rounded cursor-pointer bg-zinc-950 border border-zinc-700" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-zinc-300">Text Color</label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-mono">{themeLightText}</span>
                                <input type="color" value={themeLightText} onChange={e=>setThemeLightText(e.target.value)} className="h-8 w-12 rounded cursor-pointer bg-zinc-950 border border-zinc-700" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-zinc-300">Primary Accent</label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-mono">{themeLightPrimary}</span>
                                <input type="color" value={themeLightPrimary} onChange={e=>setThemeLightPrimary(e.target.value)} className="h-8 w-12 rounded cursor-pointer bg-zinc-950 border border-zinc-700" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dark Theme */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Dark Mode</h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-zinc-300">Background</label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-mono">{themeDarkBg}</span>
                                <input type="color" value={themeDarkBg} onChange={e=>setThemeDarkBg(e.target.value)} className="h-8 w-12 rounded cursor-pointer bg-zinc-950 border border-zinc-700" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-zinc-300">Text Color</label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-mono">{themeDarkText}</span>
                                <input type="color" value={themeDarkText} onChange={e=>setThemeDarkText(e.target.value)} className="h-8 w-12 rounded cursor-pointer bg-zinc-950 border border-zinc-700" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-zinc-300">Primary Accent</label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-mono">{themeDarkPrimary}</span>
                                <input type="color" value={themeDarkPrimary} onChange={e=>setThemeDarkPrimary(e.target.value)} className="h-8 w-12 rounded cursor-pointer bg-zinc-950 border border-zinc-700" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-zinc-800">
                        <button 
                          onClick={handleUpdateTheme} 
                          disabled={isSavingTheme}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" /> Save Theme
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              Select a client to view details
            </div>
          )}
        </div>
      </div>

      {/* Snippet Modal */}
      {showSnippetModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
              <h3 className="text-lg font-medium text-zinc-200">Integration Snippet</h3>
              <button onClick={() => setShowSnippetModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-zinc-400 mb-4">Paste this tag into the <code>&lt;head&gt;</code> of the client's website.</p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 break-all relative group">
                {`<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="${selectedClient.id}" defer></script>`}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="${selectedClient.id}" defer></script>`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute top-2 right-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Code className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
              <h3 className="text-lg font-medium text-zinc-200">Register New Client</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterClient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Company Name</label>
                <input required type="text" value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Contact Email</label>
                <input required type="email" value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Whitelisted Domains</label>
                <input required type="text" placeholder="e.g. auraworks.co.za" value={newWhitelistedDomains} onChange={e => setNewWhitelistedDomains(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium">Register Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
