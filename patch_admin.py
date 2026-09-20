import sys

def patch():
    with open('frontend/src/app/(authenticated)/aurahq/admin/page.tsx', 'r') as f:
        content = f.read()

    # 1. Update interface
    if 'theme_config?: any;' not in content:
        content = content.replace('custom_monthly_amount?: number;', 'custom_monthly_amount?: number;\n  theme_config?: any;')

    # 2. Add state variables near other states
    if 'const [themeLightBg, setThemeLightBg] = useState' not in content:
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
"""
        content = content.replace('const [monthlyAmountInput, setMonthlyAmountInput] = useState(\'\');', 'const [monthlyAmountInput, setMonthlyAmountInput] = useState(\'\');' + state_injection)

    # 3. Handle selection change to populate states
    # Find handleSelectClient
    if 'setThemeLightBg(client.theme_config?.light?.bg ||' not in content:
        populate = """
    if (client.theme_config) {
      setThemeLightBg(client.theme_config.light?.bg || '#ffffff');
      setThemeLightText(client.theme_config.light?.text || '#111827');
      setThemeLightPrimary(client.theme_config.light?.primary || '#10b981');
      setThemeDarkBg(client.theme_config.dark?.bg || '#111827');
      setThemeDarkText(client.theme_config.dark?.text || '#ffffff');
      setThemeDarkPrimary(client.theme_config.dark?.primary || '#10b981');
    } else {
      setThemeLightBg('#ffffff'); setThemeLightText('#111827'); setThemeLightPrimary('#10b981');
      setThemeDarkBg('#111827'); setThemeDarkText('#ffffff'); setThemeDarkPrimary('#10b981');
    }
"""
        content = content.replace('setMonthlyAmountInput(client.custom_monthly_amount ? (client.custom_monthly_amount / 100).toString() : \'\');', 'setMonthlyAmountInput(client.custom_monthly_amount ? (client.custom_monthly_amount / 100).toString() : \'\');' + populate)

    # 4. Handle Save Theme function
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


    # 5. UI section injection
    if 'Brand Theme Configuration' not in content:
        ui = """
              {/* BRAND THEME CONFIGURATION */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-zinc-100 mb-4">Brand Theme Configuration</h3>
                
                <div className="flex border-b border-zinc-800 mb-4">
                  <button 
                    onClick={() => setActiveThemeTab('light')}
                    className={`pb-2 px-4 text-xs font-medium transition-colors ${activeThemeTab === 'light' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Light Mode
                  </button>
                  <button 
                    onClick={() => setActiveThemeTab('dark')}
                    className={`pb-2 px-4 text-xs font-medium transition-colors ${activeThemeTab === 'dark' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Dark Mode
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Background</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={activeThemeTab === 'light' ? themeLightBg : themeDarkBg} onChange={e => activeThemeTab === 'light' ? setThemeLightBg(e.target.value) : setThemeDarkBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-zinc-800 border-0" />
                        <input type="text" value={activeThemeTab === 'light' ? themeLightBg : themeDarkBg} onChange={e => activeThemeTab === 'light' ? setThemeLightBg(e.target.value) : setThemeDarkBg(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={activeThemeTab === 'light' ? themeLightText : themeDarkText} onChange={e => activeThemeTab === 'light' ? setThemeLightText(e.target.value) : setThemeDarkText(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-zinc-800 border-0" />
                        <input type="text" value={activeThemeTab === 'light' ? themeLightText : themeDarkText} onChange={e => activeThemeTab === 'light' ? setThemeLightText(e.target.value) : setThemeDarkText(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Primary/Accent</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={activeThemeTab === 'light' ? themeLightPrimary : themeDarkPrimary} onChange={e => activeThemeTab === 'light' ? setThemeLightPrimary(e.target.value) : setThemeDarkPrimary(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-zinc-800 border-0" />
                        <input type="text" value={activeThemeTab === 'light' ? themeLightPrimary : themeDarkPrimary} onChange={e => activeThemeTab === 'light' ? setThemeLightPrimary(e.target.value) : setThemeDarkPrimary(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 w-full" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
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
                      className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                    >
                      Copy to {activeThemeTab === 'light' ? 'Dark' : 'Light'} Mode
                    </button>
                    <button
                      onClick={handleSaveTheme}
                      disabled={isSavingTheme}
                      className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSavingTheme ? 'Saving...' : 'Save Theme'}
                    </button>
                  </div>
                  {themeSaveSuccess && <p className="text-xs text-green-400 mt-2 text-right">Theme updated successfully!</p>}
                </div>
              </div>
"""
        content = content.replace('{/* BILLING AMOUNT OVERRIDE */}', ui + '\n              {/* BILLING AMOUNT OVERRIDE */}')
    
    with open('frontend/src/app/(authenticated)/aurahq/admin/page.tsx', 'w') as f:
        f.write(content)

patch()
