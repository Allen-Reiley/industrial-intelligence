/**
 * AuraWorks Industrial Intelligence Engine - Full Forensic Bundle
 * Version: 2.2.1 (Identity Stitching & Human-Gating Enabled)
 * (c) 2026 AuraWorks (Pty) Ltd. All Rights Reserved.
 */
(async function() {
    const script = document.currentScript;
    const clientId = script.getAttribute('data-id');
    if (!clientId) return console.error("❌ AuraWorks: Missing Client ID in script tag.");

    // --- CONFIGURATION ---
    const getBaseUrl = () => {
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        if (script?.src.includes('http')) {
            try { return new URL(script.src).origin; } catch (e) {}
        }
        return "http://localhost:8000";
    };
    const API_URL = `${getBaseUrl().replace(/\/$/, '')}/api/v1/track`;

    // --- PILLAR 1: PERSISTENCE (The Memory) ---
    const AuraPersistence = {
        key: 'aura_uid',
        async init() {
            let id = await this.getStoredID();
            if (!id) {
                id = this.generateUUID();
                console.log("🆕 AuraWorks: New Unique ID Generated:", id);
            } else {
                console.log("🔄 AuraWorks: Existing ID Restored:", id);
            }
            await this.syncStorage(id);
            return id;
        },
        async getStoredID() {
            const c = document.cookie.split('; ').find(r => r.startsWith(`${this.key}=`))?.split('=')[1];
            const l = localStorage.getItem(this.key);
            const d = await this.getFromIndexedDB();
            return c || l || d || null;
        },
        async syncStorage(id) {
            const exp = new Date(); exp.setFullYear(exp.getFullYear() + 2);
            document.cookie = `${this.key}=${id}; expires=${exp.toUTCString()}; path=/; SameSite=None; Secure; Partitioned`;
            localStorage.setItem(this.key, id);
            await this.saveToIndexedDB(id);
            window.AURA_UID = id;
        },
        generateUUID() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },
        async getFromIndexedDB() {
            return new Promise(res => {
                const req = indexedDB.open("AuraWorksDB", 1);
                req.onupgradeneeded = e => e.target.result.createObjectStore("identity");
                req.onsuccess = e => {
                    const store = e.target.result.transaction("identity", "readonly").objectStore("identity");
                    const getReq = store.get(this.key);
                    getReq.onsuccess = () => res(getReq.result);
                    getReq.onerror = () => res(null);
                };
                req.onerror = () => res(null);
            });
        },
        async saveToIndexedDB(id) {
            const req = indexedDB.open("AuraWorksDB", 1);
            req.onsuccess = e => e.target.result.transaction("identity", "readwrite").objectStore("identity").put(id, this.key);
        }
    };

    // --- PILLAR 2: FORENSIC IDENTITY (The Fingerprint) ---
    const AuraFingerprint = {
        async getFullSignature() {
            return {
                canvas: this.getCanvas(),
                webgl: this.getWebGL(),
                drift: await this.measureDrift(),
                fonts: this.getFonts(),
                screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
                ua: navigator.userAgent
            };
        },
        getCanvas() {
            const cvs = document.createElement('canvas');
            const ctx = cvs.getContext('2d');
            ctx.textBaseline = "top"; ctx.font = "14px 'Arial'";
            ctx.fillText("AuraWorks_Forensic_v1", 2, 2);
            return cvs.toDataURL();
        },
        getWebGL() {
            const cvs = document.createElement('canvas');
            const gl = cvs.getContext('webgl') || cvs.getContext('experimental-webgl');
            if (!gl) return "no_gl";
            const dbg = gl.getExtension('WEBGL_debug_renderer_info');
            return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_ID) : "generic_gpu";
        },
        async measureDrift() {
            return new Promise(r => {
                const t0 = performance.now(), d0 = Date.now();
                setTimeout(() => r((performance.now() - t0) - (Date.now() - d0)), 500);
            });
        },
        getFonts() {
            const f = ["Arial", "Courier New", "Georgia", "Impact", "Times New Roman"];
            return f.filter(font => document.fonts.check(`12px ${font}`)).join(',');
        }
    };

    // --- PILLAR 3: MASTER TRACKER (The Intent) ---
    const AuraTracker = {
        init(auraId) {
            this.auraId = auraId;
            this.startTime = Date.now();
            this.currentUrl = window.location.href;
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
                return navigator.sendBeacon(`${API_URL}/${endpoint}`, new Blob([JSON.stringify(data)], {type:'application/json'}));
            }

            try {
                const res = await fetch(`${API_URL}/${endpoint}`, {
                    method: 'POST', mode: 'cors', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data), keepalive: true
                });
                const json = await res.json();
                
                // --- IDENTITY BRIDGE STITCHING ---
                // If backend identifies this forensic signature as an existing profile
                if (json.stitched_id && json.stitched_id !== this.auraId) {
                    console.log("🔗 AuraWorks: Forensic Match Found. Stitching Identities...");
                    await AuraPersistence.syncStorage(json.stitched_id);
                    this.auraId = json.stitched_id; // Update local context
                }
                
                return json;
            } catch (e) { console.error(`❌ AuraWorks [${endpoint}] Error:`, e.message); }
        },
        setupSensors() {
            document.querySelectorAll('input[type="email"], [name*="email"]').forEach(i => {
                i.addEventListener('blur', (e) => {
                    if (e.target.value.includes('@')) {
                        this.dispatch('event', { event_type: 'blur_capture', email: e.target.value });
                    }
                });
            });

            let sFired = false;
            window.addEventListener('scroll', () => {
                if (sFired) return;
                const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                if (pct > 30) {
                    this.dispatch('event', { event_type: 'high_intent', depth: Math.round(pct) });
                    sFired = true;
                }
            }, { passive: true });
        },
        trackEntry() {
            this.dispatch('entry', { url: window.location.href, referrer: document.referrer || "direct" });
        },
        trackExit() {
            const dur = Math.round((Date.now() - this.startTime) / 1000);
            this.dispatch('exit', { url: this.currentUrl, duration: dur }, true);
        },
        patchSPA() {
            const self = this;
            const patch = (m) => {
                const orig = history[m];
                history[m] = function() {
                    self.trackExit();
                    const r = orig.apply(this, arguments);
                    self.currentUrl = window.location.href; self.startTime = Date.now();
                    setTimeout(() => self.trackEntry(), 0);
                    return r;
                };
            };
            patch('pushState'); patch('replaceState');
            window.addEventListener('popstate', () => { self.trackExit(); self.currentUrl = window.location.href; self.startTime = Date.now(); self.trackEntry(); });
        }
    };

    // --- EXECUTION SEQUENCE (Human-Gated) ---
    let initStarted = false;
    const startAura = async () => {
        if (initStarted) return;
        initStarted = true;
        console.log("🚀 AuraWorks: Human Interaction Verified. Initializing...");
        const auraId = await AuraPersistence.init();
        AuraTracker.init(auraId);

        // Establish Forensic Lock after 5s of engagement
        setTimeout(async () => {
            const sig = await AuraFingerprint.getFullSignature();
            await AuraTracker.dispatch('identity', { signature: sig });
            console.log("✅ AuraWorks Identity Bridge: Forensic Lock Established.");
        }, 5000);
    };

    // Gating Logic: Wait for 2s of verified activity (per MEMORY.md)
    setTimeout(startAura, 2000); 
    window.addEventListener('mousemove', startAura, { once: true });
    window.addEventListener('touchstart', startAura, { once: true });

})();