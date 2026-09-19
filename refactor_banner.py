import re

with open("tracker/src/banner/banner.js", "r") as f:
    content = f.read()

# 1. Insert extractHostTheme before createDOM
extraction_logic = """
    function extractHostTheme() {
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
            function isValid(c) {
                return c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' && c !== 'inherit' && c !== 'none';
            }

            function getLuminance(rgbStr) {
                // Basic parsing for rgb(), rgba(), or hex
                // Since getComputedStyle usually returns rgb() or rgba()
                const match = rgbStr.match(/\\d+(\\.\\d+)?/g);
                if (!match || match.length < 3) return 1;
                let [r, g, b] = match.slice(0, 3).map(Number);
                r /= 255; g /= 255; b /= 255;
                const sRGB = [r,g,b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
                return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
            }

            const colors = { bg: {}, accent: {} };
            const els = document.querySelectorAll('header, nav, main, button, a, h1, h2');
            els.forEach(el => {
                // skip our own elements
                if (el.closest('#aura-consent-root')) return;
                
                const style = window.getComputedStyle(el);
                const bg = style.backgroundColor;
                const fg = style.color;
                
                if (el.tagName === 'MAIN' || el.tagName === 'BODY' || el.tagName === 'HEADER') {
                    if (isValid(bg)) colors.bg[bg] = (colors.bg[bg] || 0) + 1;
                } else if (el.tagName === 'BUTTON' || el.tagName === 'A') {
                    if (isValid(bg)) colors.accent[bg] = (colors.accent[bg] || 0) + 1;
                    if (isValid(fg)) colors.accent[fg] = (colors.accent[fg] || 0) + 1;
                }
            });

            const rootStyle = window.getComputedStyle(document.documentElement);
            // Handle ok-lch, rgb, hex via computed style
            // We just grab the raw value, but checking luminance requires rgb.
            // If the site uses pure CSS vars, we'll try our best.
            // But getComputedStyle on an element returns rgb().
            // So we'll rely on the dom queries more heavily for luminance.
            const getMostFreq = (dict) => Object.entries(dict).sort((a,b) => b[1]-a[1])[0]?.[0];
            const domBg = getMostFreq(colors.bg);
            const domAccent = getMostFreq(colors.accent);

            if (domBg) {
                // apply a slight transparency if it's solid rgb, or just use it
                theme.bg = domBg.replace('rgb(', 'rgba(').replace(')', ', 0.95)');
                // If it was already rgba, just use it
                if (domBg.includes('rgba')) theme.bg = domBg;
            }
            if (domAccent) theme.accent = domAccent;

            // Compute contrast against background
            const bgForLuminance = domBg || 'rgb(255, 255, 255)';
            const luminance = getLuminance(bgForLuminance);
            
            if (luminance < 0.5) {
                // Dark background
                theme.text = '#F9FAFB';
                theme.textMuted = '#9CA3AF';
                theme.border = 'rgba(255, 255, 255, 0.1)';
                theme.inputBg = 'rgba(255, 255, 255, 0.05)';
                theme.btnBg = '#F9FAFB';
                theme.btnText = '#111827';
                theme.btnHover = '#E5E7EB';
                theme.overlay = 'rgba(0, 0, 0, 0.85)';
                theme.modalBg = '#1f2937';
            } else {
                // Light background
                theme.text = '#111827';
                theme.textMuted = '#4B5563';
                theme.border = 'rgba(0, 0, 0, 0.08)';
                theme.inputBg = '#F3F4F6';
                theme.btnBg = '#111827';
                theme.btnText = '#F9FAFB';
                theme.btnHover = '#374151';
                theme.overlay = 'rgba(255, 255, 255, 0.85)';
                theme.modalBg = '#ffffff';
            }
        } catch(e) {
            console.error('Aura Banner: Theme extraction failed', e);
        }
        return theme;
    }

    function createDOM() {
"""

content = content.replace("    function createDOM() {\n", extraction_logic)

# 2. Add const t = extractHostTheme(); to createDOM()
create_dom_start = """    function createDOM() {
        if (document.getElementById('aura-consent-root')) return;

        const t = extractHostTheme();

        container = document.createElement('div');
"""
content = re.sub(
    r"    function createDOM\(\) \{\s*if \(document\.getElementById\('aura-consent-root'\)\) return;\s*container = document\.createElement\('div'\);",
    create_dom_start,
    content
)

# 3. Replace static colors in style string with dynamic ones.
# First, insert the CSS variables in the :host selector
host_css_vars = """            :host {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                --aura-bg: ${t.bg};
                --aura-text: ${t.text};
                --aura-text-muted: ${t.textMuted};
                --aura-border: ${t.border};
                --aura-input-bg: ${t.inputBg};
                --aura-btn-bg: ${t.btnBg};
                --aura-btn-text: ${t.btnText};
                --aura-btn-hover: ${t.btnHover};
                --aura-accent: ${t.accent};
                --aura-overlay: ${t.overlay};
                --aura-modal-bg: ${t.modalBg};
            }"""

content = re.sub(r"            :host \{.*?\}", host_css_vars, content, flags=re.DOTALL)

# 4. Map the CSS colors in the block to the vars.
# Since we know the colors from the previous light mode rewrite, we can replace them exactly.
# Note: background: rgba(255, 255, 255, 0.95); -> background: var(--aura-bg);
# border: 1px solid rgba(0, 0, 0, 0.08); -> border: 1px solid var(--aura-border);
# color: #0f172a; -> color: var(--aura-text);
# color: #475569; -> color: var(--aura-text-muted);
# color: #64748b; -> color: var(--aura-text-muted);
# background: rgba(0, 0, 0, 0.05); -> background: var(--aura-input-bg); (for options icon)
# background: #f1f5f9; -> background: var(--aura-input-bg);
# background: #f8fafc; -> background: var(--aura-input-bg);
# border: 1px solid #cbd5e1; -> border: 1px solid var(--aura-border);
# color: #f8fafc; -> color: var(--aura-btn-text);
# background: #0f172a; -> background: var(--aura-btn-bg);
# background: #1e293b; -> background: var(--aura-btn-hover);
# border-bottom: 1px solid #e2e8f0; -> border-bottom: 1px solid var(--aura-border);
# background: rgba(255, 255, 255, 0.85); -> background: var(--aura-overlay);
# background: #ffffff; -> background: var(--aura-modal-bg);
# background: #10b981; -> background: var(--aura-accent); (accent btn bg, tab active border)
# color: #10b981; -> color: var(--aura-accent);

styles_block_match = re.search(r"style\.textContent = `(.*?)`;", content, re.DOTALL)
if styles_block_match:
    css = styles_block_match.group(1)
    
    # Text
    css = css.replace("color: #0f172a;", "color: var(--aura-text);")
    css = css.replace("color: #475569;", "color: var(--aura-text-muted);")
    css = css.replace("color: #64748b;", "color: var(--aura-text-muted);")
    
    # Backgrounds
    css = css.replace("background: rgba(255, 255, 255, 0.95);", "background: var(--aura-bg);")
    css = css.replace("background: #f1f5f9;", "background: var(--aura-input-bg);")
    css = css.replace("background: #f8fafc;", "background: var(--aura-input-bg);")
    css = css.replace("background: rgba(0, 0, 0, 0.05);", "background: var(--aura-border);") # divider/option icon fallback
    
    # Borders
    css = css.replace("border: 1px solid rgba(0, 0, 0, 0.08);", "border: 1px solid var(--aura-border);")
    css = css.replace("border: 1px solid #cbd5e1;", "border: 1px solid var(--aura-border);")
    css = css.replace("border-bottom: 1px solid #e2e8f0;", "border-bottom: 1px solid var(--aura-border);")
    
    # Primary Buttons
    css = css.replace("background: #0f172a;", "background: var(--aura-btn-bg);")
    css = css.replace("color: #f8fafc;", "color: var(--aura-btn-text);")
    css = css.replace("background: #1e293b;", "background: var(--aura-btn-hover);")
    
    # Accents
    css = css.replace("background: #10b981;", "background: var(--aura-accent);")
    css = css.replace("border-color: #10b981;", "border-color: var(--aura-accent);")
    css = css.replace("border-bottom-color: #10b981;", "border-bottom-color: var(--aura-accent);")
    css = css.replace("box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);", "box-shadow: 0 0 0 2px var(--aura-border);")
    css = css.replace("background: #34d399;", "opacity: 0.9;") # hover for accent

    # Modals
    css = css.replace("background: rgba(255, 255, 255, 0.85);", "background: var(--aura-overlay);")
    css = css.replace("background: #ffffff;", "background: var(--aura-modal-bg);")

    # Put it back
    content = content.replace(styles_block_match.group(1), css)

with open("tracker/src/banner/banner.js", "w") as f:
    f.write(content)

print("Refactor complete")
