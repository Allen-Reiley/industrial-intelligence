/**
 * AuraWorks Industrial Intelligence Engine - Full Forensic Bundle
 * Version: 2.2.4 (Geometric Fingerprinting & Entity Capture)
 * (c) 2026 AuraWorks (Pty) Ltd. All Rights Reserved.
 */
(async function() {
    const script = document.currentScript;
    
    const clientId = window.AURA_ID || script?.getAttribute('data-id');
    
    if (!clientId) {
        return console.error("❌ AuraWorks: Missing Client Identity context.");
    }

    const getBaseUrl = () => {
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        if (script?.src.includes('http')) {
            try { return new URL(script.src).origin; } catch (e) {}
        }
        return "http://localhost:8000";
    };
    
    const API_URL = `${getBaseUrl().replace(/\/$/, '')}/api/v1/track`;

    // --- PILLAR 1: PERSISTENCE ---
    const AuraPersistence = {
        key: 'aura_uid',
        async init() {
            let id = await this.getStoredID();
            if (!id) {
                id = this.generateUUID();
                console.log("🆕 AuraWorks: New Unique ID Generated");
            } else {
                console.log("🔄 AuraWorks: Identity Restored");
            }
            await this.syncStorage(id);
            return id;
        },
        async getStoredID() {
            const c = document.cookie.split('; ').find(r => r.startsWith(`${this.key}=`))?.split('=')[1];
            const l = localStorage.getItem(this.key);
            return c || l || null;
        },
        async syncStorage(id) {
            const exp = new Date(); exp.setFullYear(exp.getFullYear() + 2);
            document.cookie = `${this.key}=${id}; expires=${exp.toUTCString()}; path=/; SameSite=Lax; Secure`;
            localStorage.setItem(this.key, id);
            window.AURA_UID = id;
        },
        generateUUID() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
    };

    // --- PILLAR 2: FORENSIC IDENTITY (Geometric Draw-and-Hash) ---
    const AuraFingerprint = {
        async getFullSignature() {
            return {
                canvas: this.getCanvas(),
                webgl: this.getWebGL(),
                drift: await this.measureDrift(),
                screen: `${screen.width}x${screen.height}`,
                ua: navigator.userAgent
            };
        },
        getCanvas() {
            try {
                const cvs = document.createElement('canvas');
                const ctx = cvs.getContext('2d');
                ctx.textBaseline = "top"; ctx.font = "14px 'Arial'";
                ctx.fillText("AuraWorks_v2", 2, 2);
                return cvs.toDataURL();
            } catch (e) { return "canvas_blocked"; }
        },
        getWebGL() {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) return "no_gl";
                
                // 1. Get Hardware Unmasked Renderer
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";

                // 2. Perform Geometric Signature (The "Draw" Task)
                // We render to a 2x2 area to capture sub-pixel dithering differences
                canvas.width = 2; canvas.height = 2;
                
                // Set a specific clear color (Industrial slate variant)
                gl.clearColor(0.09, 0.09, 0.11, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                
                // 3. Extract the raw pixel data (The "Hashable" result)
                const pixels = new Uint8Array(4);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                
                // 4. Combine Identity + Geometric Signature
                const signature = Array.from(pixels).join('-');
                return `${renderer}_sig_${signature}`;
            } catch (e) { 
                return "gl_error"; 
            }
        },
        async measureDrift() {
            return new Promise(r => {
                const t0 = performance.now(), d0 = Date.now();
                setTimeout(() => r(Math.round((performance.now() - t0) - (Date.now() - d0))), 500);
            });
        }
    };

    // --- PILLAR 3: MASTER TRACKER ---
    const AuraTracker = {
        init(auraId) {
            this.auraId = auraId;
            this.startTime = Date.now();
            this.trackEntry();
            this.setupSensors();
            this.patchSPA();
        },
        async dispatch(endpoint, payload, useBeacon = false) {
            const data = {
                client_id: clientId,
                aura_id: this.auraId,
                timestamp: new Date().toISOString(),
                ...payload
            };

            if (useBeacon && navigator.sendBeacon) {
                return navigator.sendBeacon(`${API_URL}/${endpoint}`, JSON.stringify(data));
            }

            try {
                await fetch(`${API_URL}/${endpoint}`, {
                    method: 'POST', mode: 'cors', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data), keepalive: true
                });
            } catch (e) {}
        },
        setupSensors() {
            document.addEventListener('blur', (e) => {
                const target = e.target;
                if (!target || !target.value) return;

                if (target.type === 'email' || target.name?.includes('email')) {
                    this.dispatch('identity', { email: target.value, capture_source: 'blur' });
                }
                
                if (target.name === 'company' || target.name === 'company_name') {
                    this.dispatch('identity', { company_name: target.value, capture_source: 'blur' });
                }
            }, true);

            let sFired = false;
            window.addEventListener('scroll', () => {
                if (sFired) return;
                const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                if (pct > 40) {
                    this.dispatch('event', { event_type: 'high_intent_scroll', depth: Math.round(pct) });
                    sFired = true;
                }
            }, { passive: true });
        },
        trackEntry() {
            this.dispatch('entry', { url: window.location.href, referrer: document.referrer || "direct" });
        },
        patchSPA() {
            const self = this;
            const patch = (m) => {
                const orig = history[m];
                history[m] = function() {
                    const r = orig.apply(this, arguments);
                    setTimeout(() => self.trackEntry(), 0);
                    return r;
                };
            };
            patch('pushState'); patch('replaceState');
        }
    };

    // --- EXECUTION ---
    let initStarted = false;
    const startAura = async () => {
        if (initStarted) return;
        initStarted = true;
        const auraId = await AuraPersistence.init();
        AuraTracker.init(auraId);
        
        setTimeout(async () => {
            const sig = await AuraFingerprint.getFullSignature();
            await AuraTracker.dispatch('identity', { signature: sig });
            console.log("✅ AuraWorks Identity Bridge: Forensic Lock Established.");
        }, 4000);
    };

    setTimeout(startAura, 1500); 
    window.addEventListener('mousedown', startAura, { once: true });
})();