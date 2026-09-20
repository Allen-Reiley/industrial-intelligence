"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Network,
  Plus,
  Code,
  Copy,
  Check,
  AlertTriangle,
  LogOut,
  Sliders,
  Database,
  ArrowRight,
  X,
  CreditCard,
  DollarSign,
  Save
} from 'lucide-react';

interface Client {
  id: string;
  company_name: string;
  domain?: string;
  whitelisted_domains: string[];
  subscription_status: 'trial' | 'active' | 'suspended';
  require_consent_banner: boolean;
  collect_personal_data: boolean;
  is_active: boolean;
  payment_method_token?: string;
  custom_monthly_amount?: number;
  theme_config?: any;
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

  // State managers
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Theme Config States
  const [themeLightBg, setThemeLightBg] = useState('#ffffff');
  const [themeLightText, setThemeLightText] = useState('#111827');
  const [themeLightPrimary, setThemeLightPrimary] = useState('#10b981');
  const [themeDarkBg, setThemeDarkBg] = useState('#111827');
  const [themeDarkText, setThemeDarkText] = useState('#ffffff');
  const [themeDarkPrimary, setThemeDarkPrimary] = useState('#10b981');
  const [activeThemeTab, setActiveThemeTab] = useState<'light'|'dark'>('light');
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [themeSaveSuccess, setThemeSaveSuccess] = useState(false);

  useEffect(() => {
    if (selectedClient) {
      const tc = selectedClient.theme_config;
      if (tc) {
        setThemeLightBg(tc.light?.bg || '#ffffff');
        setThemeLightText(tc.light?.text || '#111827');
        setThemeLightPrimary(tc.light?.primary || '#10b981');
        setThemeDarkBg(tc.dark?.bg || '#111827');
        setThemeDarkText(tc.dark?.text || '#ffffff');
        setThemeDarkPrimary(tc.dark?.primary || '#10b981');
      } else {
        setThemeLightBg('#ffffff'); setThemeLightText('#111827'); setThemeLightPrimary('#10b981');
        setThemeDarkBg('#111827'); setThemeDarkText('#ffffff'); setThemeDarkPrimary('#10b981');
      }
    }
  }, [selectedClient]);

  
  // Installation status polling
  const [installationStatus, setInstallationStatus] = useState<{ installed: boolean; visit_count: number }>({ installed: false, visit_count: 0 });
  const [isPolling, setIsPolling] = useState(false);

  // Modal controls
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newWhitelistedDomains, setNewWhitelistedDomains] = useState('');
  const [newRequireConsent, setNewRequireConsent] = useState(false);
  const [newSubStatus, setNewSubStatus] = useState<'trial' | 'active' | 'suspended'>('trial');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Billing states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [monthlyAmountInput, setMonthlyAmountInput] = useState<string>('10000');
  const [isSavingAmount, setIsSavingAmount] = useState(false);
  const [saveAmountSuccess, setSaveAmountSuccess] = useState(false);
  const [saveAmountError, setSaveAmountError] = useState('');
  
  // Webhook Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<'success' | 'failed' | ''>('');
  const [simulationError, setSimulationError] = useState('');
  const [simulationType, setSimulationType] = useState<'successful' | 'failed'>('successful');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


  const logout = () => {
    document.cookie = 'admin_access_token=; path=/; max-age=0;';
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/login');
  };

  // Fetch all clients
  const fetchClients = async (selectDefaultId?: string) => {
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/`, {
        credentials: 'include'
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error('Failed to retrieve clients list.');
      const data = await res.json();
      setClients(data);
      
      if (data.length > 0) {
        const nextSelected = selectDefaultId 
          ? data.find((c: Client) => c.id === selectDefaultId) || data[0]
          : data[0];
        setSelectedClient(nextSelected);
      }
    } catch (err) {
      console.error("🚨 Clients Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads for the selected client
  const fetchLeads = async (clientId: string) => {
    setLeadsLoading(true);
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/leads/?client_id=${clientId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to retrieve client leads.');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error("🚨 Leads Fetch Error:", err);
      setLeads([]);
    } finally {
      setLeadsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Check installation status
  const checkInstallation = async (clientId: string) => {
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/${clientId}/verify`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to verify installation.');
      const data = await res.json();
      setInstallationStatus(data);
      return data.installed;
    } catch (err) {
      console.error("🚨 Installation Verification Failure:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Update leads, installation, billing config & history when selected client changes
  useEffect(() => {
    if (selectedClient) {
      fetchLeads(selectedClient.id);
      checkInstallation(selectedClient.id);
      fetchTransactions(selectedClient.id);
      
      const amountInRands = selectedClient.custom_monthly_amount != null 
        ? (selectedClient.custom_monthly_amount / 100).toString() 
        : '10000';
      setMonthlyAmountInput(amountInRands);
      
      setIsPolling(true);
    } else {
      setIsPolling(false);
    }
  }, [selectedClient]);

  const fetchTransactions = async (clientId: string) => {
    setTransactionsLoading(true);
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/billing/transactions?client_id=${clientId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to retrieve transactions.');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("🚨 Transactions Fetch Error:", err);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleSaveMonthlyAmount = async () => {
    if (!selectedClient) return;
    setIsSavingAmount(true);
    setSaveAmountSuccess(false);
    setSaveAmountError('');

    const parsedAmount = parseFloat(monthlyAmountInput);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setSaveAmountError('Invalid amount. Enter a positive number.');
      setIsSavingAmount(false);
      return;
    }

    const amountInCents = Math.round(parsedAmount * 100);

    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/${selectedClient.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          custom_monthly_amount: amountInCents
        })
      });

      if (!res.ok) throw new Error('Failed to update monthly billing amount.');
      
      const updatedClient = await res.json();
      
      // Update local clients state
      setClients(prev => prev.map(c => c.id === updatedClient.id ? { ...c, ...updatedClient } : c));
      setSelectedClient(prev => prev && prev.id === updatedClient.id ? { ...prev, ...updatedClient } : prev);
      
      setSaveAmountSuccess(true);
      setTimeout(() => setSaveAmountSuccess(false), 3000);
    } catch (err: any) {
      setSaveAmountError(err.message || 'An error occurred.');
    } finally {
      setIsSavingAmount(false);
    }
  };

  
  const handleSaveTheme = async () => {
    if (!selectedClient) return;
    setIsSavingTheme(true);
    setThemeSaveSuccess(false);

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

      if (!res.ok) throw new Error('Failed to update theme config.');
      const updatedClient = await res.json();
      
      setClients(prev => prev.map(c => c.id === updatedClient.id ? { ...c, ...updatedClient } : c));
      setSelectedClient(prev => prev && prev.id === updatedClient.id ? { ...prev, ...updatedClient } : prev);
      
      setThemeSaveSuccess(true);
      setTimeout(() => setThemeSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!selectedClient) return;
    setIsSimulating(true);
    setSimulationStatus('');
    setSimulationError('');

    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/billing/simulate-webhook`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: selectedClient.id,
          status: simulationType,
          amount: selectedClient.custom_monthly_amount || 1000000
        })
      });

      if (!res.ok) throw new Error('Simulation failed.');
      
      const data = await res.json();
      setSimulationStatus('success');
      
      // Refresh client data and transaction history!
      await fetchClients(selectedClient.id);
      await fetchTransactions(selectedClient.id);
      
    } catch (err: any) {
      setSimulationError(err.message || 'Simulation error.');
      setSimulationStatus('failed');
    } finally {
      setIsSimulating(false);
    }
  };

  // Installation Polling Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && selectedClient && !installationStatus.installed) {
      interval = setInterval(async () => {
        const isInstalled = await checkInstallation(selectedClient.id);
        if (isInstalled) {
          setIsPolling(false);
          // Refresh leads once installed
          fetchLeads(selectedClient.id);
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, selectedClient, installationStatus.installed]);

  // Client Registration Submission
  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    const domainsArray = newWhitelistedDomains
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    if (domainsArray.length === 0) {
      setFormError('Please enter at least one whitelisted domain.');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_name: newCompanyName,
          whitelisted_domains: domainsArray,
          require_consent_banner: newRequireConsent,
          subscription_status: newSubStatus,
          is_active: newSubStatus !== 'suspended'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to register client profile.');
      }

      const registered = await res.json();
      
      // Reset form fields
      setNewCompanyName('');
      setNewWhitelistedDomains('');
      setNewRequireConsent(false);
      setNewSubStatus('trial');
      setShowRegisterModal(false);

      // Refresh list and select the new client
      await fetchClients(registered.id);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred during client registration.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCopySnippet = () => {
    if (!selectedClient) return;
    const snippet = `<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="${selectedClient.id}" defer></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchStr = `${lead.name || ''} ${lead.email || ''} ${lead.position || ''} ${lead.company?.name || ''} ${lead.company?.domain || ''}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [leads, searchTerm]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = leads.length;
    const warmCount = leads.filter(l => l.is_warm).length;
    const warmRate = total ? Math.round((warmCount / total) * 100) : 0;
    const activeVisits = installationStatus.visit_count;
    return { total, warmCount, warmRate, activeVisits };
  }, [leads, installationStatus]);

  // Export to CSV
  const handleExport = () => {
    if (leads.length === 0 || !selectedClient) return;
    const headers = ['Identity Name', 'Email Address', 'Corporate Role', 'Department', 'Entity Company', 'Website', 'Industry', 'Warm Lead', 'Captured At'];
    const rows = leads.map(l => [
      l.name || 'Anonymous Prospect',
      l.email || 'N/A',
      l.position || 'N/A',
      l.department || 'N/A',
      l.company?.name || 'Unverified',
      l.company?.domain || 'N/A',
      l.company?.industry || 'N/A',
      l.is_warm ? 'Yes' : 'No',
      l.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Leads_${selectedClient.company_name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#070708]">
      <div className="h-8 w-8 border-2 border-zinc-900 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Resolving Multi-Tenant Ledgers...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 pb-20 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-zinc-900 bg-[#070708]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <Building2 className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-indigo-400 font-bold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>Console Core</span>
              </div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-300">Admin Control Console</h1>
            </div>
          </div>

          {/* Client Tenant Switcher */}
          {clients.length > 0 && selectedClient && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest hidden sm:inline">Active Tenant:</span>
              <select 
                value={selectedClient.id} 
                onChange={(e) => {
                  const target = clients.find(c => c.id === e.target.value);
                  if (target) setSelectedClient(target);
                }}
                className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-300 font-medium focus:outline-none focus:border-indigo-500/40"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>

              <button 
                onClick={() => setShowRegisterModal(true)}
                className="h-8 px-3 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/15 flex items-center gap-1.5 text-xs font-semibold transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Register Tenant</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button 
              onClick={logout}
              className="p-2 hover:bg-zinc-900 rounded-full border border-zinc-850 transition-colors text-zinc-500 hover:text-zinc-350"
              title="Logout from console"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {clients.length === 0 ? (
        <div className="max-w-md mx-auto mt-32 p-8 border border-zinc-850 bg-zinc-950/20 rounded-2xl text-center backdrop-blur-md">
          <Database className="h-10 w-10 text-zinc-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">No Clients Registered</h2>
          <p className="text-xs text-zinc-500 mt-2 mb-6">Create your first client tenant profile to initialize telemetry tracking snippets.</p>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <Plus className="h-4 w-4" /> Register Client
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 mt-10">
          {selectedClient && (
            <div className="border border-zinc-850/70 rounded-2xl bg-zinc-950/20 backdrop-blur-md p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-light tracking-tight">{selectedClient.company_name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    selectedClient.subscription_status === 'active' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/15' 
                      : selectedClient.subscription_status === 'trial'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                      : 'bg-red-500/10 text-red-400 border border-red-500/15'
                  }`}>
                    {selectedClient.subscription_status}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{selectedClient.whitelisted_domains.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-zinc-600" />
                    <span>Consent Banner: {selectedClient.require_consent_banner ? 'Required' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              {/* Snippet and Installation verify state */}
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => setShowSnippetModal(true)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs text-zinc-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Code className="h-3.5 w-3.5 text-zinc-400" /> Script Tag
                </button>

                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${installationStatus.installed ? 'bg-green-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {installationStatus.installed ? 'Installed & Active' : 'Awaiting Tracking'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="border border-zinc-850/60 rounded-xl p-5 bg-zinc-950/10 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Total Hits</div>
              <div className="text-3xl font-light text-zinc-200">{stats.activeVisits}</div>
            </div>
            <div className="border border-zinc-850/60 rounded-xl p-5 bg-zinc-950/10 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Leads Captured</div>
              <div className="text-3xl font-light text-zinc-200">{stats.total}</div>
            </div>
            <div className="border border-zinc-850/60 rounded-xl p-5 bg-zinc-950/10 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Identified Profiles</div>
              <div className="text-3xl font-light text-zinc-200">{stats.warmCount}</div>
            </div>
            <div className="border border-zinc-850/60 rounded-xl p-5 bg-zinc-950/10 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Warm Profile Rate</div>
              <div className="text-3xl font-light text-indigo-400">{stats.warmRate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Leads Control & Table (Col span 3) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search and Export */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <input 
                    type="text" 
                    placeholder="Search leads by name, email, company, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-850 bg-zinc-950/10 text-zinc-250 text-sm focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-zinc-650"
                  />
                </div>
                
                <button 
                  onClick={handleExport}
                  disabled={leads.length === 0}
                  className="p-3 px-5 bg-zinc-950/60 border border-zinc-850 hover:bg-zinc-900 rounded-lg text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Download className="h-4 w-4" /> Export CSV
                </button>
                <button 
                  onClick={() => selectedClient && fetchLeads(selectedClient.id)} 
                  className="p-3 hover:bg-zinc-900 rounded-lg border border-zinc-850 bg-zinc-950/60 transition-colors flex items-center justify-center"
                >
                  <RefreshCcw className={`h-4 w-4 text-zinc-400 ${leadsLoading || isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Leads Table */}
              <div className="border border-zinc-850/60 rounded-xl overflow-x-auto bg-zinc-950/10 shadow-2xl backdrop-blur-sm">
                {leadsLoading ? (
                  <div className="py-24 text-center">
                    <div className="h-6 w-6 border-2 border-zinc-850 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Querying database...</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950/40 text-zinc-500 text-[10px] uppercase tracking-[0.25em] border-b border-zinc-850">
                      <tr>
                        <th className="px-6 py-4 font-bold">Identity</th>
                        <th className="px-6 py-4 font-bold">Corporate Firmographics</th>
                        <th className="px-6 py-4 font-bold">Role / Dept</th>
                        <th className="px-6 py-4 font-bold">Warm Status</th>
                        <th className="px-6 py-4 font-bold text-right">Captured</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/50">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-zinc-900/10 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 group-hover:border-indigo-500/25 transition-colors">
                                <User className="h-4 w-4 text-zinc-500" />
                              </div>
                              <div>
                                <div className="font-semibold text-zinc-250 group-hover:text-indigo-400 transition-colors leading-none mb-1">
                                  {lead.name || "Anonymous Prospect"}
                                </div>
                                <div className="text-[10px] text-zinc-500 font-mono tracking-tighter flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-zinc-600" /> {lead.email || "Identity Hidden"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-medium text-zinc-300">{lead.company?.name || "Unverified Entity"}</div>
                            {lead.company?.domain && (
                              <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                <Globe className="h-3 w-3 text-zinc-650" />
                                <a 
                                  href={`https://${lead.company.domain}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline text-indigo-400"
                                >
                                  {lead.company.domain}
                                </a>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-zinc-300 text-xs font-semibold">{lead.position || 'Visitor'}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{lead.department || 'Operations'}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              lead.is_warm 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/15' 
                                : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {lead.is_warm ? 'Warm' : 'Silent'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
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
                )}

                {filteredLeads.length === 0 && !leadsLoading && (
                  <div className="py-24 text-center">
                    <Activity className="h-8 w-8 text-zinc-800 mb-3 mx-auto animate-pulse" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">No Leads Recorded</h3>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Billing Hub (Col span 1) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Billing Hub Card */}
              <div className="border border-zinc-850/60 rounded-xl p-5 bg-zinc-950/10 backdrop-blur-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-350">Billing Hub</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Subscription State:</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      selectedClient.subscription_status === 'active' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/15' 
                        : selectedClient.subscription_status === 'trial'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                        : 'bg-red-500/10 text-red-400 border border-red-500/15'
                    }`}>
                      {selectedClient.subscription_status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Payment Method:</span>
                    <span className="text-zinc-300 font-mono text-[10px] max-w-[120px] truncate" title={selectedClient.payment_method_token}>
                      {selectedClient.payment_method_token ? `Saved (*${selectedClient.payment_method_token.slice(-4)})` : 'None'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Last Charge:</span>
                    <span className="text-zinc-300">
                      {(() => {
                        const successfulTxs = transactions.filter(t => t.status === 'successful');
                        if (successfulTxs.length > 0) {
                          const last = successfulTxs[0];
                          return `R${(last.amount / 100).toLocaleString()} (${new Date(last.created_at).toLocaleDateString([], {month: 'short', day: 'numeric'})})`;
                        }
                        return 'N/A';
                      })()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <label htmlFor="monthlyRateInput" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Monthly Amount (ZAR)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600 font-bold">R</span>
                      <input 
                        id="monthlyRateInput"
                        type="number"
                        min="0"
                        value={monthlyAmountInput}
                        onChange={(e) => setMonthlyAmountInput(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-950 border border-zinc-850 focus:border-indigo-500/40 focus:outline-none rounded-lg text-xs text-zinc-200 transition-colors"
                      />
                    </div>
                    <button 
                      onClick={handleSaveMonthlyAmount}
                      disabled={isSavingAmount}
                      className="p-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 disabled:opacity-50 text-indigo-400 rounded-lg flex items-center justify-center transition-colors shrink-0"
                      title="Save monthly amount"
                    >
                      {isSavingAmount ? (
                        <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                      ) : saveAmountSuccess ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  {saveAmountError && (
                    <p className="text-[10px] text-red-400">{saveAmountError}</p>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-900">
                  <label htmlFor="simulationTypeSelect" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Simulation Tool</label>
                  <div className="flex gap-2">
                    <select 
                      id="simulationTypeSelect"
                      value={simulationType}
                      onChange={(e) => setSimulationType(e.target.value as any)}
                      className="bg-zinc-950 border border-zinc-850 rounded-lg px-2 py-1.5 text-xs text-zinc-300 font-medium focus:outline-none focus:border-indigo-500/40 flex-grow"
                    >
                      <option value="successful">Success Webhook</option>
                      <option value="failed">Failure Webhook</option>
                    </select>
                    <button
                      onClick={handleSimulateWebhook}
                      disabled={isSimulating}
                      className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 disabled:opacity-50 text-indigo-400 border border-indigo-500/15 text-xs font-semibold rounded-lg transition-all shrink-0"
                    >
                      {isSimulating ? 'Sending...' : 'Trigger'}
                    </button>
                  </div>
                  {simulationStatus === 'success' && (
                    <p className="text-[10px] text-green-400">Webhook ping simulated successfully!</p>
                  )}
                  {simulationStatus === 'failed' && (
                    <p className="text-[10px] text-red-400">{simulationError || 'Simulation failed.'}</p>
                  )}
                </div>
              </div>

              
              {/* BRAND THEME CONFIGURATION */}
              <div className="border border-zinc-850/60 rounded-xl p-5 bg-zinc-950/10 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-350">Brand Theme Configuration</h3>
                </div>
                
                <div className="flex border-b border-zinc-800 mb-4 pb-2">
                  <button 
                    onClick={() => setActiveThemeTab('light')}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors mr-2 ${activeThemeTab === 'light' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => setActiveThemeTab('dark')}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${activeThemeTab === 'dark' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Dark
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Background</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={activeThemeTab === 'light' ? themeLightBg : themeDarkBg} onChange={e => activeThemeTab === 'light' ? setThemeLightBg(e.target.value) : setThemeDarkBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-zinc-800 border-0 shrink-0" />
                        <input type="text" value={activeThemeTab === 'light' ? themeLightBg : themeDarkBg} onChange={e => activeThemeTab === 'light' ? setThemeLightBg(e.target.value) : setThemeDarkBg(e.target.value)} className="bg-zinc-950 border border-zinc-850 rounded px-2 py-1.5 text-xs text-zinc-300 w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={activeThemeTab === 'light' ? themeLightText : themeDarkText} onChange={e => activeThemeTab === 'light' ? setThemeLightText(e.target.value) : setThemeDarkText(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-zinc-800 border-0 shrink-0" />
                        <input type="text" value={activeThemeTab === 'light' ? themeLightText : themeDarkText} onChange={e => activeThemeTab === 'light' ? setThemeLightText(e.target.value) : setThemeDarkText(e.target.value)} className="bg-zinc-950 border border-zinc-850 rounded px-2 py-1.5 text-xs text-zinc-300 w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={activeThemeTab === 'light' ? themeLightPrimary : themeDarkPrimary} onChange={e => activeThemeTab === 'light' ? setThemeLightPrimary(e.target.value) : setThemeDarkPrimary(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-zinc-800 border-0 shrink-0" />
                        <input type="text" value={activeThemeTab === 'light' ? themeLightPrimary : themeDarkPrimary} onChange={e => activeThemeTab === 'light' ? setThemeLightPrimary(e.target.value) : setThemeDarkPrimary(e.target.value)} className="bg-zinc-950 border border-zinc-850 rounded px-2 py-1.5 text-xs text-zinc-300 w-full" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-zinc-900">
                    <button
                      onClick={() => {
                        if (activeThemeTab === 'light') {
                          setThemeDarkBg(themeLightBg === '#ffffff' ? '#111827' : themeLightBg);
                          setThemeDarkText(themeLightText === '#111827' ? '#ffffff' : themeLightText);
                          setThemeDarkPrimary(themeLightPrimary);
                        } else {
                          setThemeLightBg(themeDarkBg === '#111827' ? '#ffffff' : themeDarkBg);
                          setThemeLightText(themeDarkText === '#ffffff' ? '#111827' : themeDarkText);
                          setThemeLightPrimary(themeDarkPrimary);
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 rounded-lg transition-colors border border-zinc-850"
                    >
                      Copy to {activeThemeTab === 'light' ? 'Dark' : 'Light'} Mode
                    </button>
                    <button
                      onClick={handleSaveTheme}
                      disabled={isSavingTheme}
                      className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 disabled:opacity-50 text-indigo-400 border border-indigo-500/15 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    >
                      {isSavingTheme ? 'Saving...' : (themeSaveSuccess ? 'Saved!' : 'Save Theme')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ledger History Card */}
              <div className="border border-zinc-850/60 rounded-xl p-5 bg-zinc-950/10 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <Database className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-350">Ledger History</h3>
                </div>
                
                {transactionsLoading ? (
                  <div className="py-8 text-center">
                    <RefreshCcw className="h-4 w-4 text-zinc-600 animate-spin mx-auto mb-2" />
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500">Querying ledger...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 text-center py-4">No transactions recorded.</p>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-start p-2.5 bg-zinc-900/30 border border-zinc-900/50 rounded-lg text-xs hover:border-zinc-850/50 transition-colors">
                        <div>
                          <div className="font-semibold text-zinc-300">
                            R{(tx.amount / 100).toLocaleString()}
                          </div>
                          <div className="text-[9px] font-mono text-zinc-650 tracking-tighter mt-0.5" title={tx.gateway_reference}>
                            Ref: {tx.gateway_reference.slice(0, 10)}...
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider mb-1 ${
                            tx.status === 'successful'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/15'
                              : tx.status === 'failed'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                              : tx.status === 'refunded'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {tx.status}
                          </span>
                          <div className="text-[9px] text-zinc-600 font-mono">
                            {new Date(tx.created_at).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER CLIENT MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0c0c0e] border border-zinc-850 rounded-2xl overflow-hidden relative shadow-2xl animate-zoom">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/35 to-transparent" />
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-250">Register New Tenant</h3>
              </div>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-550 hover:text-zinc-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterClient} className="p-6 space-y-6">
              {formError && (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="companyName" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Company Name</label>
                <input 
                  id="companyName"
                  type="text" 
                  required
                  placeholder="e.g. Acme Industrial Mining"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500/40 focus:outline-none rounded-lg p-3 text-sm text-zinc-200 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="whitelistedDomains" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Whitelisted Domains</label>
                <input 
                  id="whitelistedDomains"
                  type="text" 
                  required
                  placeholder="e.g. acme.com, staging.acme.com"
                  value={newWhitelistedDomains}
                  onChange={(e) => setNewWhitelistedDomains(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500/40 focus:outline-none rounded-lg p-3 text-sm text-zinc-200 transition-colors"
                />
                <span className="text-[10px] text-zinc-650 block">Comma-separated list of domains whitelisted to call client script tag APIs.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="subStatus" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Subscription Status</label>
                  <select 
                    id="subStatus"
                    value={newSubStatus}
                    onChange={(e) => setNewSubStatus(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500/40 focus:outline-none rounded-lg p-3 text-sm text-zinc-300"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6 pl-2">
                  <input 
                    type="checkbox" 
                    id="requireConsent"
                    checked={newRequireConsent}
                    onChange={(e) => setNewRequireConsent(e.target.checked)}
                    className="h-4 w-4 bg-zinc-950 border border-zinc-850 rounded focus:ring-indigo-500/20 text-indigo-650 cursor-pointer"
                  />
                  <label htmlFor="requireConsent" className="text-xs text-zinc-400 select-none cursor-pointer font-medium">Require Consent Banner</label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-semibold uppercase tracking-widest text-zinc-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                >
                  {formLoading ? 'Registering...' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SNIPPET MODAL */}
      {showSnippetModal && selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0c0c0e] border border-zinc-850 rounded-2xl overflow-hidden relative shadow-2xl animate-zoom">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/35 to-transparent" />
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-250 font-sans">Edge Deployment Tag</h3>
              </div>
              <button 
                onClick={() => setShowSnippetModal(false)}
                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-550 hover:text-zinc-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Embed this client-side tracking tag immediately inside the production HTML <code className="text-amber-400 font-mono text-[11px]">&lt;head&gt;</code> tag of <strong className="text-zinc-200">{selectedClient.company_name}</strong> to initialize B2B identity analytics.
              </p>

              <div className="relative group">
                <pre className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 pr-12 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {`<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="${selectedClient.id}" defer></script>`}
                </pre>
                
                <button
                  onClick={handleCopySnippet}
                  className="absolute right-3 top-3 p-2 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-250 transition-all shadow-md flex items-center justify-center"
                  title="Copy snippet to clipboard"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {installationStatus.installed ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider">Installation Verified</h4>
                    <p className="text-[11px] text-zinc-400 leading-normal mt-1">
                      Our tracking engine has received {installationStatus.visit_count} verification payloads for this client_id. Analytics collection is active.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider animate-pulse">Awaiting Verification Payload</h4>
                    <p className="text-[11px] text-zinc-400 leading-normal mt-1">
                      The console is actively polling the Visit table. Ensure the script tag is embedded on the whitelisted domains and trigger a visitor page view.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowSnippetModal(false)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-semibold uppercase tracking-widest text-zinc-300 transition-colors"
              >
                Close Deployment Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}