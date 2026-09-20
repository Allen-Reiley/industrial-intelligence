import sys

def rewrite():
    with open('tracker/src/banner/banner.js', 'r') as f:
        lines = f.readlines()
        
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if 'function extractHostTheme()' in line:
            start_idx = i
        if 'function createDOM()' in line and start_idx != -1:
            end_idx = i
            break
            
    if start_idx != -1 and end_idx != -1:
        new_fn = """    function extractHostTheme() {
        let theme = {
            bg: 'rgba(255, 255, 255, 0.95)',
            primary: '#0f172a',
            accent: '#10b981',
            text: '#111827',
            textMuted: '#4B5563',
            border: 'rgba(0, 0, 0, 0.08)',
            inputBg: '#F3F4F6',
            btnBg: '#111827',
            btnText: '#F9FAFB',
            btnHover: '#374151',
            overlay: 'rgba(255, 255, 255, 0.85)',
            modalBg: '#ffffff'
        };

        try {
            if (config && config.theme_config) {
                const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                const mode = isDark ? 'dark' : 'light';
                const tc = config.theme_config[mode] || config.theme_config['light'] || config.theme_config['dark'] || {};
                
                if (tc.bg) {
                    theme.bg = tc.bg;
                    theme.modalBg = tc.bg;
                    theme.overlay = isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)';
                }
                if (tc.text) {
                    theme.text = tc.text;
                    // Muted is slightly transparent text
                    theme.textMuted = tc.text + '99'; 
                } else if (tc.bg) {
                    // Check luminance for default text if not provided
                    const rgb = hexToRgb(tc.bg);
                    const lum = rgb ? (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255 : (isDark ? 0 : 1);
                    theme.text = lum < 0.5 ? '#F9FAFB' : '#111827';
                    theme.textMuted = lum < 0.5 ? '#9CA3AF' : '#4B5563';
                }
                
                if (tc.primary) {
                    theme.primary = tc.primary;
                    theme.accent = tc.primary;
                    theme.btnBg = tc.primary;
                    
                    const rgb = hexToRgb(tc.primary);
                    const lum = rgb ? (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255 : 0;
                    theme.accentText = lum < 0.5 ? '#ffffff' : '#111827';
                }
                if (tc.btnText) {
                    theme.btnText = tc.btnText;
                }
            }
        } catch(e) {
            console.error('Aura Banner: Theme config application failed', e);
        }
        return theme;
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

"""
        lines = lines[:start_idx] + [new_fn] + lines[end_idx:]
        
        with open('tracker/src/banner/banner.js', 'w') as f:
            f.writelines(lines)
        print("Success")

rewrite()
