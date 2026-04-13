/**
 * AuraWorks Industrial Intelligence Engine - Full Forensic Bundle
 * Version: 3.2.1 (POPIA Compliant & Validation Fixed)
 * (c) 2026 AuraWorks (Pty) Ltd. All Rights Reserved.
 */
(async function() {
    const script = document.currentScript;
    // clientSecret is the ID of the agency/site owner from the script tag
    const clientSecret = window.AURA_ID || script?.getAttribute('data-id');
    window.AURA_START_TIME = performance.now();
    
    if (!clientSecret) return console.error("❌ AuraWorks: Missing Client Identity.");

    const getBaseUrl = () => {
        // 1. Highest Priority: Explicit config (Manual override)
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        
        // 2. Intelligence: Auto-detect where the script is being served from
        if (script?.src.includes('http')) {
            try { return new URL(script.src).origin; } catch (e) {}
        }
        
        // 3. The Safeguard: Direct path to the Railway Engine
        // Using the Railway URL ensures that even if the main site is down, 
        // the forensic tracking still hits the backend.
        return "https://dynamic-flow-production-a5d6.up.railway.app";
    };
    
    const API_URL = `${getBaseUrl().replace(/\/$/, '')}/api/v1/track`;

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
                is_residential_prob: (conn?.saveData || (conn?.downlink && conn.downlink < 10))
            };
        },
        getCanvas() {
            try {
                const cvs = document.createElement('canvas');
                const ctx = cvs.getContext('2d');
                ctx.textBaseline = "top"; ctx.font = "14px 'Arial'";
                ctx.fillText("AuraWorks_v3.2", 2, 2);
                return cvs.toDataURL().substring(0, 100);
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

    const AuraTracker = {
        isArmed: false, 

        init(auraId) {
            this.auraId = auraId;
            this.trackEntry();
            this.setupSensors();
            this.patchSPA();

            window.addEventListener('aura_consent_granted', () => {
                this.isArmed = true;
                this.dispatch('event', { event_type: 'consent_granted' });
            });
        },
        async dispatch(endpoint, payload, useBeacon = false) {
            const utms = AuraPersistence.getStoredUTMs();
            
            // Backend Mapping: 
            // - client_id: Used by track_exit and track_event to find the Visit record (must be the visitor UID)
            // - aura_id: Forensic unique ID (this.auraId)
            // - agency_id: The ID from the script data-id (clientSecret)
            
            const data = {
                client_id: this.auraId, // Set visitor ID here to satisfy backend validation
                aura_id: this.auraId,
                agency_id: clientSecret,
                timestamp: new Date().toISOString(),
                ...utms,
                ...payload
            };

            const url = `${API_URL}/${endpoint}`;

            if (useBeacon && navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                return navigator.sendBeacon(url, blob);
            }
            try {
                await fetch(url, {
                    method: 'POST', 
                    mode: 'cors', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify(data), 
                    keepalive: true
                });
            } catch (e) { console.error("Aura dispatch error", e); }
        },
        setupSensors() {
            document.addEventListener('blur', (e) => {
                if (!this.isArmed) return; 
                const target = e.target;
                if (target.type === 'email' || target.name?.includes('email')) {
                    if (target.value.includes('@')) {
                        this.dispatch('identity', { email: target.value, capture_source: 'authorized_blur' });
                    }
                }
            }, true);

            document.addEventListener('click', (e) => {
                const btn = e.target.closest('a, button');
                if (!btn) return;
                const text = btn.innerText?.toLowerCase();
                const intentKeywords = ['pricing', 'audit', 'feature', 'solution', 'waitlist', 'get started'];
                if (intentKeywords.some(kw => text.includes(kw))) {
                    this.dispatch('event', { event_type: 'intent_click', intent_cluster: text.substring(0, 20), url: window.location.pathname });
                }
            });

            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') this.trackExit();
            });

            window.addEventListener('pagehide', () => this.trackExit());
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
        trackExit() {
            const duration = Math.round((performance.now() - window.AURA_START_TIME) / 1000);
            if (duration < 1) return;
            
            this.dispatch('exit', {
                event_type: 'exit',
                duration: duration,
                url: window.location.href
            }, true); 
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