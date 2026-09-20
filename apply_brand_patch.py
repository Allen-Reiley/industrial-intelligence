import sys

def patch():
    with open('frontend/src/app/(authenticated)/aurahq/admin/page.tsx', 'r') as f:
        content = f.read()

    # 1. Update interface
    if 'theme_config?: any;' not in content:
        content = content.replace('custom_monthly_amount?: number;', 'custom_monthly_amount?: number;\n  theme_config?: any;')

    # 2. Add state variables and useEffect
    if 'const [themeLightBg, setThemeLightBg]' not in content:
        state_injection = """
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
"""
        content = content.replace('const [searchTerm, setSearchTerm] = useState(\'\');', 'const [searchTerm, setSearchTerm] = useState(\'\');' + state_injection)

    # 3. Handle Save Theme function
    if 'const handleSaveTheme =' not in content:
        save_fn = """
  const handleSaveTheme = async () => {
    if (!selectedClient) return;
    setIsSavingTheme(true);
    setThemeSaveSuccess(false);

    const theme_config = {
      light: { bg: themeLightBg, text: themeLightText, primary: themeLightPrimary },
      dark: { bg: themeDarkBg, text: themeDarkText, primary: themeDarkPrimary }
    };

    try {
      const res = await fetch(`${API_BASE.replace(/\\/$/, '')}/api/v1/clients/${selectedClient.id}`, {
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
"""
        content = content.replace('const handleSimulateWebhook = async () => {', save_fn + '\n  const handleSimulateWebhook = async () => {')

    # 4. UI section injection
    if 'Brand Theme Configuration' not in content:
        ui = """
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
"""
        content = content.replace('{/* Ledger History Card */}', ui + '\n              {/* Ledger History Card */}')
    
    with open('frontend/src/app/(authenticated)/aurahq/admin/page.tsx', 'w') as f:
        f.write(content)

patch()
