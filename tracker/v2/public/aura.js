/**
 * AuraWorks Industrial Intelligence Engine - Full Forensic Bundle
 * Version: 2.3.0 (UTM Attribution & Intent Clustering)
 * (c) 2026 AuraWorks (Pty) Ltd. All Rights Reserved.
 */
(async function() {
    const script = document.currentScript;
    const clientId = window.AURA_ID || script?.getAttribute('data-id');
    
    if (!clientId) return console.error("❌ AuraWorks: Missing Client Identity.");

    const getBaseUrl = () => {
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        if (script?.src.includes('http')) {
            try { return new URL(script.src).origin; } catch (e) {}
        }
        return "http://localhost:8000";
    };
    
    const API_URL = `${getBaseUrl().replace(/\/$/, '')}/api/v1/track`;

    // --- PILLAR 1: PERSISTENCE & ATTRIBUTION ---
    const AuraPersistence = {
        key: 'aura_uid',
        utmKey: 'aura_utm',
        async init() {
            let id = await this.getStoredID();
            if (!id) {
                id = this.generateUUID();
                this.captureUTMs(); // Only capture fresh UTMs on new or entry session
            }
            await this.syncStorage(id);
            return id;
        },
        captureUTMs() {
            const params = new URLSearchParams(window.location.search);
            const utms = {};
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
                if (params.get(key)) utms[key] = params.get(key);
            });
            if (Object.keys(utms).length > 0) {
                localStorage.setItem(this.utmKey, JSON.stringify(utms));
            }
        },
        getStoredUTMs() {
            try { return JSON.parse(localStorage.getItem(this.utmKey)) || {}; } catch(e) { return {}; }
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

    // --- PILLAR 2: FORENSIC IDENTITY (Unchanged - Geometric Draw-and-Hash) ---
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
                ctx.fillText("AuraWorks_v2.3", 2, 2);
                return cvs.toDataURL();
            } catch (e) { return "canvas_blocked"; }
        },
        getWebGL() {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) return "no_gl";
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";
                canvas.width = 2; canvas.height = 2;
                gl.clearColor(0.09, 0.09, 0.11, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                const pixels = new Uint8Array(4);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                return `${renderer}_sig_${Array.from(pixels).join('-')}`;
            } catch (e) { return "gl_error"; }
        },
        async measureDrift() {
            return new Promise(r => {
                const t0 = performance.now(), d0 = Date.now();
                setTimeout(() => r(Math.round((performance.now() - t0) - (Date.now() - d0))), 500);
            });
        }
    };

    // --- PILLAR 3: MASTER TRACKER (Updated for Attribution) ---
    const AuraTracker = {
        init(auraId) {
            this.auraId = auraId;
            this.trackEntry();
            this.setupSensors();
            this.patchSPA();
        },
        async dispatch(endpoint, payload, useBeacon = false) {
            const data = {
                client_id: clientId,
                aura_id: this.auraId,
                timestamp: new Date().toISOString(),
                attribution: AuraPersistence.getStoredUTMs(), // Attach UTM context to every signal
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
            // Identity Capture (Blur)
            document.addEventListener('blur', (e) => {
                const target = e.target;
                if (!target || !target.value) return;
                if (target.type === 'email' || target.name?.includes('email')) {
                    this.dispatch('identity', { email: target.value, capture_source: 'blur' });
                }
            }, true);

            // Intent Capture (Scroll)
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
            this.dispatch('entry', { 
                url: window.location.href, 
                referrer: document.referrer || "direct",
                screen_res: `${window.innerWidth}x${window.innerHeight}`
            });
        },
        patchSPA() {
            const self = this;
            ['pushState', 'replaceState'].forEach(m => {
                const orig = history[m];
                history[m] = function() {
                    const r = orig.apply(this, arguments);
                    setTimeout(() => self.trackEntry(), 0);
                    return r;
                };
            });
        }
    };

    // --- EXECUTION ---
    let initStarted = false;
    const startAura = async () => {
        if (initStarted) return;
        initStarted = true;
        const auraId = await AuraPersistence.init();
        AuraTracker.init(auraId);
        
        // Establish Forensic Lock after a slight delay
        setTimeout(async () => {
            const sig = await AuraFingerprint.getFullSignature();
            await AuraTracker.dispatch('identity', { signature: sig });
            console.log("✅ AuraWorks Identity Bridge: Forensic Lock Established.");
        }, 3000);
    };

    // Boot Logic
    if (document.readyState === 'complete') startAura();
    else window.addEventListener('load', startAura);
    window.addEventListener('mousedown', startAura, { once: true });
})();