/**
 * AuraWorks Industrial Intelligence Engine - Full Forensic Bundle
 * Version: 3.0.0 (Quarantine & Forensic Lock Ready)
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

    // --- PILLAR 1: PERSISTENCE (Triple-Lock Storage) ---
    const AuraPersistence = {
        key: 'aura_uid',
        utmKey: 'aura_utm',
        async init() {
            let id = await this.getStoredID();
            this.captureUTMs(); 
            if (!id) id = this.generateUUID();
            await this.syncStorage(id);
            return id;
        },
        captureUTMs() {
            const params = new URLSearchParams(window.location.search);
            const utms = {};
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
                const val = params.get(key);
                if (val) utms[key] = val;
            });
            if (Object.keys(utms).length > 0) {
                localStorage.setItem(this.utmKey, JSON.stringify({...utms, captured_at: new Date().toISOString()}));
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

    // --- PILLAR 2: FORENSIC SIGNATURES ---
    const AuraFingerprint = {
        async getFullSignature() {
            return {
                canvas: this.getCanvas(),
                webgl: this.getWebGL(),
                network: this.getNetworkInfo(),
                drift: await this.measureDrift(),
                screen: `${screen.width}x${screen.height}`,
                is_incognito: await this.isIncognito()
            };
        },
        getNetworkInfo() {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            return {
                type: conn?.effectiveType || "unknown",
                rtt: conn?.rtt,
                downlink: conn?.downlink,
                is_residential_prob: (conn?.saveData || conn?.downlink < 10) // Heuristic for mobile/DSL
            };
        },
        getCanvas() {
            try {
                const cvs = document.createElement('canvas');
                const ctx = cvs.getContext('2d');
                ctx.textBaseline = "top"; ctx.font = "14px 'Arial'";
                ctx.fillText("AuraWorks_v3.0", 2, 2);
                return cvs.toDataURL().substring(0, 100); // Send hash snippet
            } catch (e) { return "blocked"; }
        },
        getWebGL() {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl');
                const debug = gl.getExtension('WEBGL_debug_renderer_info');
                return debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "standard";
            } catch (e) { return "standard"; }
        },
        async measureDrift() {
            return new Promise(r => {
                const t0 = performance.now(), d0 = Date.now();
                setTimeout(() => r(Math.round((performance.now() - t0) - (Date.now() - d0))), 500);
            });
        },
        async isIncognito() {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const {quota} = await navigator.storage.estimate();
                return quota < 120000000;
            }
            return false;
        }
    };

    // --- PILLAR 3: TRACKER & COMPLIANCE UI ---
    const AuraTracker = {
        init(auraId) {
            this.auraId = auraId;
            this.trackEntry();
            this.setupSensors();
            this.patchSPA();
        },
        async dispatch(endpoint, payload, useBeacon = false) {
            const utms = AuraPersistence.getStoredUTMs();
            const data = {
                client_id: clientId,
                aura_id: this.auraId,
                timestamp: new Date().toISOString(),
                ...utms,
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
        showHandshake() {
            // POPIA Compliance: Brief visual feedback on identity capture
            const toast = document.createElement('div');
            toast.style = "position:fixed;bottom:20px;right:20px;background:#18181b;color:#fff;padding:10px 15px;border-radius:4px;font-size:12px;border:1px solid #27272a;z-index:99999;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.5);";
            toast.innerHTML = "🛡️ AuraWorks: Industrial Identity Secure";
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        },
        setupSensors() {
            document.addEventListener('blur', (e) => {
                const target = e.target;
                if (target.type === 'email' || target.name?.includes('email')) {
                    if (target.value.includes('@')) {
                        this.dispatch('identity', { email: target.value, capture_source: 'blur' });
                        this.showHandshake();
                    }
                }
            }, true);

            document.addEventListener('click', (e) => {
                const btn = e.target.closest('a, button');
                if (!btn) return;
                const text = btn.innerText?.toLowerCase();
                const intentKeywords = ['pricing', 'audit', 'feature', 'solution', 'waitlist'];
                if (intentKeywords.some(kw => text.includes(kw))) {
                    this.dispatch('event', { event_type: 'intent_click', intent_cluster: text.substring(0, 20), url: window.location.pathname });
                }
            });
        },
        trackEntry() {
            const sig = AuraFingerprint.getNetworkInfo();
            this.dispatch('entry', { 
                url: window.location.href, 
                referrer: document.referrer || "direct",
                screen_resolution: `${window.innerWidth}x${window.innerHeight}`,
                effective_connection_type: sig.type,
                downlink_speed: sig.downlink,
                rtt: sig.rtt
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
    const startAura = async () => {
        if (window.AURA_INITIALIZED) return;
        window.AURA_INITIALIZED = true;
        const auraId = await AuraPersistence.init();
        AuraTracker.init(auraId);
        
        setTimeout(async () => {
            const sig = await AuraFingerprint.getFullSignature();
            await AuraTracker.dispatch('identity', { signature: sig });
        }, 2000);
    };

    if (document.readyState === 'complete') startAura();
    else window.addEventListener('load', startAura);
})();