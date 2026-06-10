/**
 * AuraWorks Industrial Intelligence Engine - Decoupled Edge Tracker
 * Version: 4.0.0 (Decoupled Edge Architecture)
 * (c) 2026 AuraWorks (Pty) Ltd. All Rights Reserved.
 */
(async function() {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const logWarn = (...args) => { if (isLocalDev) console.warn(...args); };
    const logError = (...args) => { if (isLocalDev) console.error(...args); };

    const script = document.currentScript || document.querySelector('script[data-client-id]') || document.querySelector('script[src*="aura.js"]');
    const agencyId = window.AURA_AGENCY_ID || script?.getAttribute('data-client-id') || script?.getAttribute('data-id');
    window.AURA_START_TIME = performance.now();
    
    if (!agencyId) {
        logError("❌ AuraWorks: Missing Client Identity.");
        return;
    }

    // Retrieve the base tracking endpoint.
    const getBaseUrl = () => {
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        return "https://api.auraworks.co.za";
    };

    const getApiPath = (subPath) => {
        const base = getBaseUrl().replace(/\/$/, '');
        if (base.includes("api.auraworks.co.za")) {
            return `${base}/v1/${subPath}`;
        }
        return `${base}/api/v1/${subPath}`;
    };
    
    const API_URL = getApiPath("track");
    const CONFIG_URL = getApiPath("clients/config");

    /**
     * Identity Persistence Layer:
     * Dual-redundancy storage mechanism syncing tracking IDs across Document Cookies 
     * and LocalStorage.
     */
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

    /**
     * Forensic Fingerprinter:
     * Assembles hardware, layout, and clock anomalies to uniquely identify browsers.
     */
    const AuraFingerprint = {
        async getFullSignature() {
            return {
                canvas: this.getCanvas(),
                webgl: this.getWebGL(),
                network: this.getNetworkInfo(),
                drift: await this.measureDrift(),
                screen: `${screen.width}x${screen.height}`,
                is_incognito: await this.isIncognito(),
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        },
        getNetworkInfo() {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            return {
                type: conn?.effectiveType || "unknown",
                rtt: conn?.rtt,
                downlink: conn?.downlink,
                is_residential_prob: !!(conn?.saveData || (conn?.downlink && conn.downlink < 10))
            };
        },
        getCanvas() {
            try {
                const cvs = document.createElement('canvas');
                const ctx = cvs.getContext('2d');
                ctx.textBaseline = "top"; ctx.font = "14px 'Arial'";
                ctx.fillText("AuraWorks_v4.0", 2, 2);
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

    /**
     * AuraTracker Engine:
     * Manages event collection, input field sensors, entry/exit checkpoints, 
     * and single-page application navigation hooks.
     */
    const AuraTracker = {
        isArmed: false, 

        initialized: false,
        init(auraId, config) {
            if (this.initialized) return;
            this.initialized = true;
            this.auraId = auraId;
            this.config = config;
            this.trackEntry();
            this.setupSensors();
            this.patchSPA();
        },
        async dispatch(endpoint, payload, useBeacon = false) {
            const utms = AuraPersistence.getStoredUTMs();
            let data = {
                client_id: agencyId, 
                aura_id: this.auraId,
                timestamp: new Date().toISOString(),
                ...utms,
                ...payload
            };

            if (endpoint === 'event') {
                const eventName = payload.event_name || payload.event_type || 'unknown';
                const properties = {};
                const standardKeys = ['client_id', 'aura_id', 'url', 'duration', 'event_type', 'intent_cluster', 'event_name', 'timestamp'];
                Object.keys(data).forEach(key => {
                    if (!standardKeys.includes(key)) {
                        properties[key] = data[key];
                    }
                });
                data = {
                    client_id: data.client_id,
                    event_name: eventName,
                    aura_id: data.aura_id,
                    url: data.url || window.location.href,
                    duration: data.duration || 0,
                    event_type: data.event_type || eventName,
                    intent_cluster: data.intent_cluster || null,
                    properties: properties,
                    timestamp: data.timestamp
                };
            }

            const url = `${API_URL}/${endpoint}`;

            if (useBeacon && navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                const success = navigator.sendBeacon(url, blob);
                if (success) return true;
            }

            if (!navigator.onLine) {
                await AuraOfflineQueue.enqueue(endpoint, data);
                return false;
            }

            try {
                const response = await fetch(url, {
                    method: 'POST', 
                    mode: 'cors', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify(data), 
                    keepalive: true
                });
                if (!response.ok) {
                    await AuraOfflineQueue.enqueue(endpoint, data);
                    return false;
                }
                return true;
            } catch (e) {
                await AuraOfflineQueue.enqueue(endpoint, data);
                return false;
            }
        },
        async sendRaw(endpoint, data) {
            const url = `${API_URL}/${endpoint}`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data),
                    keepalive: true
                });
                return response.ok;
            } catch (e) {
                return false;
            }
        },
        setupSensors() {
            document.addEventListener('blur', (e) => {
                const target = e.target;
                const fieldName = target.name?.toLowerCase() || "";
                
                if (target.type === 'email' || fieldName.includes('email')) {
                    if (target.value.includes('@')) {
                        this.dispatch('identity', { email: target.value, capture_source: 'field_blur' });
                    }
                } else if (fieldName.includes('company') && target.value.length > 2) {
                    this.dispatch('identity', { company_name: target.value, capture_source: 'field_blur' });
                }
            }, true);

            document.addEventListener('click', (e) => {
                const btn = e.target.closest('a, button');
                if (!btn) return;
                const text = btn.innerText?.toLowerCase();
                const intentKeywords = ['pricing', 'audit', 'feature', 'solution', 'prospect', 'get started'];
                if (intentKeywords.some(kw => text.includes(kw))) {
                    this.dispatch('event', { 
                        event_type: 'intent_click', 
                        intent_cluster: text.substring(0, 20), 
                        url: window.location.href 
                    });
                }
            });

            // Asset Download Gate (Phase 04):
            document.addEventListener('click', (e) => {
                const anchor = e.target.closest('a');
                if (anchor && anchor.href) {
                    const href = anchor.href.toLowerCase();
                    if (href.match(/\.(pdf|zip|dwg|dxf|cad|step|igs)$/)) {
                        const hasConsent = document.cookie.split('; ').some(row => row.startsWith('aura_consent=true')) || localStorage.getItem('aura_consent_given') === 'true';
                        if (!hasConsent) {
                            e.preventDefault();
                            
                            // Load banner dynamically if not already present, then trigger Phase 04
                            if (!document.querySelector('script[src*="banner.js"]')) {
                                const s = document.createElement('script');
                                s.src = window.AURA_CONFIG?.bannerUrl || "https://banner.auraworks.co.za/banner.js";
                                s.defer = true;
                                s.onload = () => {
                                    window.dispatchEvent(new CustomEvent('aura:ready', {
                                        detail: { auraId: this.auraId, clientId: agencyId, config: this.config }
                                    }));
                                    setTimeout(() => {
                                        window.dispatchEvent(new CustomEvent('aura:trigger_banner', { detail: { phase: 4 } }));
                                    }, 50);
                                };
                                document.head.appendChild(s);
                            } else {
                                window.dispatchEvent(new CustomEvent('aura:trigger_banner', { detail: { phase: 4 } }));
                            }
                        }
                    }
                }
            }, true);

            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') this.trackExit();
            });

            window.addEventListener('pagehide', () => this.trackExit());
        },
        trackEntry() {
            const conn = AuraFingerprint.getNetworkInfo();
            this.dispatch('entry', { 
                url: window.location.href, 
                referrer: document.referrer || "direct",
                screen_resolution: `${window.innerWidth}x${window.innerHeight}`,
                effective_connection_type: conn.type,
                downlink_speed: conn.downlink,
                rtt: conn.rtt
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

    let enqueuePromise = Promise.resolve();

    /**
     * AuraOfflineQueue:
     * IndexedDB-based queue that stores telemetry events offline when connection is lost.
     */
    const AuraOfflineQueue = {
        db: null,
        dbName: 'AuraOfflineDB',
        storeName: 'AuraEventsStore',
        
        async init() {
            return new Promise((resolve) => {
                try {
                    const request = indexedDB.open(this.dbName, 1);
                    request.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains(this.storeName)) {
                            db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                        }
                    };
                    request.onsuccess = (e) => {
                        this.db = e.target.result;
                        resolve(true);
                        this.flush();
                    };
                    request.onerror = () => {
                        resolve(false);
                    };
                } catch (e) {
                    resolve(false);
                }
            });
        },
        
        async enqueue(endpoint, payload) {
            return new Promise((resolve) => {
                enqueuePromise = enqueuePromise.then(async () => {
                    if (!this.db) {
                        resolve(false);
                        return;
                    }
                    try {
                        const events = await this.getQueuedEvents();
                        if (events.length >= 100) {
                            // Drop the oldest event (first one in queue) to prevent memory leak/bloat
                            await this.removeEvent(events[0].id);
                        }
                        const transaction = this.db.transaction([this.storeName], 'readwrite');
                        const store = transaction.objectStore(this.storeName);
                        store.add({ endpoint, payload, timestamp: new Date().toISOString(), attempts: 0 });
                        transaction.oncomplete = () => {
                            resolve(true);
                            this.flush();
                        };
                        transaction.onerror = () => resolve(false);
                    } catch (e) {
                        resolve(false);
                    }
                });
            });
        },
        
        async getQueuedEvents() {
            return new Promise((resolve) => {
                if (!this.db) {
                    resolve([]);
                    return;
                }
                try {
                    const transaction = this.db.transaction([this.storeName], 'readonly');
                    const store = transaction.objectStore(this.storeName);
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result || []);
                    request.onerror = () => resolve([]);
                } catch (e) {
                    resolve([]);
                }
            });
        },
        
        async removeEvent(id) {
            return new Promise((resolve) => {
                if (!this.db) {
                    resolve(false);
                    return;
                }
                try {
                    const transaction = this.db.transaction([this.storeName], 'readwrite');
                    const store = transaction.objectStore(this.storeName);
                    store.delete(id);
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = () => resolve(false);
                } catch (e) {
                    resolve(false);
                }
            });
        },

        async updateEvent(event) {
            return new Promise((resolve) => {
                if (!this.db) {
                    resolve(false);
                    return;
                }
                try {
                    const transaction = this.db.transaction([this.storeName], 'readwrite');
                    const store = transaction.objectStore(this.storeName);
                    store.put(event);
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = () => resolve(false);
                } catch (e) {
                    resolve(false);
                }
            });
        },

        isFlushing: false,
        
        async flush(attempt = 0) {
            if (this.isFlushing || !navigator.onLine) return;
            this.isFlushing = true;
            
            try {
                const events = await this.getQueuedEvents();
                if (events.length === 0) {
                    this.isFlushing = false;
                    return;
                }
                
                for (const event of events) {
                    if (!navigator.onLine) break;
                    try {
                        const success = await AuraTracker.sendRaw(event.endpoint, event.payload);
                        if (success) {
                            await this.removeEvent(event.id);
                        } else {
                            throw new Error("Flush send raw failed");
                        }
                    } catch (e) {
                        this.isFlushing = false;
                        
                        // Increment retry attempts and cap them to prevent infinite loops / memory leak
                        const attempts = (event.attempts || 0) + 1;
                        if (attempts >= 5) {
                            await this.removeEvent(event.id);
                            logWarn(`AuraWorks: Event exceeded max retries (5). Discarded.`, event);
                        } else {
                            event.attempts = attempts;
                            await this.updateEvent(event);
                        }

                        const delay = Math.min(1000 * Math.pow(2, attempt), 60000);
                        setTimeout(() => this.flush(attempt + 1), delay);
                        return;
                    }
                }
            } catch (e) {
                // Keep queue intact
            }
            this.isFlushing = false;
        }
    };

    window.addEventListener('online', () => {
        AuraOfflineQueue.flush();
    });

    const startAura = async () => {
        if (window.AURA_INITIALIZED) return;
        window.AURA_INITIALIZED = true;
        
        await AuraOfflineQueue.init();
        
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        let config = null;
        try {
            const response = await fetch(`${CONFIG_URL}?client_id=${agencyId}&tz=${encodeURIComponent(tz)}`, {
                method: 'GET',
                mode: 'cors'
            });
            if (response.ok) {
                config = await response.json();
            }
        } catch (e) {
            logWarn("AuraWorks: Failed to fetch remote config.", e);
        }
        
        if (config && config.is_active === false) {
            logWarn("AuraWorks: Client license inactive. Tracking halted.");
            return;
        }

        const auraId = await AuraPersistence.init();
        
        // Register decoupled global event listeners
        window.addEventListener('aura_consent_granted', () => {
            AuraTracker.isArmed = true;
            AuraTracker.init(auraId, config);
            AuraTracker.dispatch('event', { event_type: 'consent_granted' });
        });

        window.addEventListener('aura_consent_updated', (e) => {
            if (e.detail?.status === 'accepted') {
                AuraTracker.isArmed = true;
                AuraTracker.init(auraId, config);
                AuraTracker.dispatch('event', { event_type: 'consent_granted', source: e.detail.source || 'banner' });
            }
        });

        window.addEventListener('aura_warm_lead', async (e) => {
            const fingerprint = await AuraFingerprint.getFullSignature();
            const payload = {
                ...e.detail,
                fingerprint,
                session_id: auraId,
                capture_source: e.detail.capture_source || 'banner_warm_signal'
            };
            await AuraTracker.dispatch('identity', payload);
        });
        
        const requireConsent = config ? config.require_consent_banner : false;
        const complianceMode = config ? config.compliance_mode : "POPIA";
        
        const hasConsent = document.cookie.split('; ').some(row => row.startsWith('aura_consent=true')) || localStorage.getItem('aura_consent_given') === 'true';
        
        if (requireConsent && !hasConsent) {
            if (complianceMode === "GDPR") {
                // Strict GDPR: Block telemetry tracking completely until consent is given
                AuraTracker.isArmed = false;
            } else {
                // POPIA: Silent B2B tracking is active
                AuraTracker.isArmed = true;
                AuraTracker.init(auraId, config);
            }
            
            // Load banner script dynamically
            const s = document.createElement('script');
            s.src = window.AURA_CONFIG?.bannerUrl || "https://banner.auraworks.co.za/banner.js";
            s.defer = true;
            s.onload = () => {
                window.dispatchEvent(new CustomEvent('aura:ready', {
                    detail: { auraId, clientId: agencyId, config }
                }));
            };
            document.head.appendChild(s);
        } else {
            // Already consented or consent banner is bypassed
            AuraTracker.isArmed = true;
            AuraTracker.init(auraId, config);
            
            // Asynchronously dispatch hardware signature
            setTimeout(async () => {
                const sig = await AuraFingerprint.getFullSignature();
                await AuraTracker.dispatch('identity', { signature: sig });
            }, 2000);

            // Dispatch aura:ready for generic listeners
            window.dispatchEvent(new CustomEvent('aura:ready', {
                detail: { auraId, clientId: agencyId, config }
            }));
        }
    };

    if (isLocalDev || window.__AURA_TESTING__) {
        window.__AURA_QUEUE__ = AuraOfflineQueue;
        window.__AURA_TRACKER__ = AuraTracker;
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') startAura();
    else window.addEventListener('load', startAura);
})();