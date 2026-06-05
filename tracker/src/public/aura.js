/**
 * AuraWorks Industrial Intelligence Engine - Full Forensic Bundle
 * Version: 3.5.0 (Full Forensics + Warm Lead Logic)
 * (c) 2026 AuraWorks (Pty) Ltd. All Rights Reserved.
 *
 * Design Architecture:
 * This script is designed to capture anonymous B2B facility traffic and corporate telemetry 
 * with zero performance impact on the host. It gathers device heuristics, network configurations, 
 * and user interactions, feeding them back to the identity resolution pipeline.
 */
(async function() {
    const script = document.currentScript;
    const agencyId = window.AURA_AGENCY_ID || script?.getAttribute('data-id');
    window.AURA_START_TIME = performance.now();
    
    if (!agencyId) return console.error("❌ AuraWorks: Missing Client Identity.");

    // Retrieve the base tracking endpoint. Falls back to the production API routing instance.
    const getBaseUrl = () => {
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        if (script?.src.includes('http')) {
            try { return new URL(script.src).origin; } catch (e) {}
        }
        return "https://dynamic-flow-production-a5d6.up.railway.app";
    };
    
    const API_URL = `${getBaseUrl().replace(/\/$/, '')}/api/v1/track`;
    const CONFIG_URL = `${getBaseUrl().replace(/\/$/, '')}/api/v1/clients/config`;

    /**
     * Identity Persistence Layer:
     * Dual-redundancy storage mechanism syncing tracking IDs across Document Cookies 
     * and LocalStorage. If a user deletes browser cookies, the ID is restored from 
     * LocalStorage on subsequent load, and vice versa, minimizing identifier churn.
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
        // Captures traffic attribution (UTM tags) from the query parameters for campaign analysis.
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
        // Reads the identifier from either cookie or LocalStorage to establish persistence.
        async getStoredID() {
            const c = document.cookie.split('; ').find(r => r.startsWith(`${this.key}=`))?.split('=')[1];
            const l = localStorage.getItem(this.key);
            return c || l || null;
        },
        // Write/Sync ID to both cookie and localStorage with a 2-year expiration window.
        async syncStorage(id) {
            const exp = new Date(); exp.setFullYear(exp.getFullYear() + 2);
            document.cookie = `${this.key}=${id}; expires=${exp.toUTCString()}; path=/; SameSite=Lax; Secure`;
            localStorage.setItem(this.key, id);
            window.AURA_UID = id;
        },
        // Generates a cryptographically strong RFC4122 version 4 UUID.
        generateUUID() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
    };

    /**
     * Forensic Fingerprinter:
     * Assembles hardware, layout, and clock anomalies to uniquely identify browsers 
     * without relying on volatile headers (like User-Agent strings).
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
        // Retrieves network telemetry details if supported by the client browser.
        getNetworkInfo() {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            return {
                type: conn?.effectiveType || "unknown",
                rtt: conn?.rtt,
                downlink: conn?.downlink,
                is_residential_prob: !!(conn?.saveData || (conn?.downlink && conn.downlink < 10))
            };
        },
        // Canvas Fingerprinting:
        // Draws text offscreen and extracts a checksum substring. Because different OS platforms 
        // and browser engines render fonts and anti-aliasing differently, this provides a highly 
        // specific browser engine fingerprint.
        getCanvas() {
            try {
                const cvs = document.createElement('canvas');
                const ctx = cvs.getContext('2d');
                ctx.textBaseline = "top"; ctx.font = "14px 'Arial'";
                ctx.fillText("AuraWorks_v3.2", 2, 2);
                return cvs.toDataURL().substring(0, 100);
            } catch (e) { return "blocked"; }
        },
        // WebGL Renderer Unmasking:
        // Requests WebGL context details and queries the GPU driver strings. This bypasses browser 
        // virtualization to extract actual physical GPU profiles (e.g. NVIDIA/Intel models).
        getWebGL() {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl');
                const debug = gl.getExtension('WEBGL_debug_renderer_info');
                return debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "standard";
            } catch (e) { return "standard"; }
        },
        // Clock Drift/Skew Detection:
        // Calculates scheduling drift between the high-resolution monotonic clock (performance.now()) 
        // and the wall-clock calendar (Date.now()) inside a setTimeout delay. Skews help detect 
        // virtualization proxies, automated scrapers, or heavily throttled hardware tabs.
        async measureDrift() {
            return new Promise(r => {
                const t0 = performance.now(), d0 = Date.now();
                setTimeout(() => r(Math.round((performance.now() - t0) - (Date.now() - d0))), 500);
            });
        },
        // Detects Private/Incognito tabs by evaluating available persistent storage allocation limits.
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

        init(auraId) {
            this.auraId = auraId;
            this.trackEntry();
            this.setupSensors();
            this.patchSPA();

            window.addEventListener('aura_consent_granted', () => {
                this.isArmed = true;
                this.dispatch('event', { event_type: 'consent_granted' });
            });

            // WARM LEAD SIGNAL: Triggered when a user interacts with lead banners or submits the waitlist form.
            window.addEventListener('aura_warm_lead', (e) => {
                this.dispatch('identity', { 
                    ...e.detail, 
                    capture_source: 'banner_warm_signal' 
                });
            });
        },
        // Dispatches event data. Falls back to Beacon API during page unloading.
        async dispatch(endpoint, payload, useBeacon = false) {
            const utms = AuraPersistence.getStoredUTMs();
            const data = {
                client_id: agencyId, 
                aura_id: this.auraId,
                timestamp: new Date().toISOString(),
                ...utms,
                ...payload
            };

            const url = `${API_URL}/${endpoint}`;

            // Safety mechanism for page-unload events:
            // sendBeacon bypasses normal async fetch queues to guarantee delivery 
            // even if the tab or browser context is destroyed immediately.
            if (useBeacon && navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                const success = navigator.sendBeacon(url, blob);
                if (success) return true;
            }

            // If offline, cache telemetry event immediately to prevent event loss
            if (!navigator.onLine) {
                await AuraOfflineQueue.enqueue(endpoint, data);
                return false;
            }

            try {
                // keepalive: true ensures the browser schedules the request to finish in the background
                // even if the user navigates away before execution completes.
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
        // Raw sender utility used exclusively for flushing cached offline queue events.
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
        // Setup input blurring and navigation click sensors.
        setupSensors() {
            // Field Blur Sensor:
            // Captures volunteer emails/companies on focus loss (blur) to record intent signals.
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

            // Click Sensor: Checks button labels to classify High-Intent path clicks.
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('a, button');
                if (!btn) return;
                const text = btn.innerText?.toLowerCase();
                const intentKeywords = ['pricing', 'audit', 'feature', 'solution', 'waitlist', 'get started'];
                if (intentKeywords.some(kw => text.includes(kw))) {
                    this.dispatch('event', { 
                        event_type: 'intent_click', 
                        intent_cluster: text.substring(0, 20), 
                        url: window.location.href 
                    });
                }
            });

            // Asset Download Gate (Phase 04):
            // Intercepts clicks on CAD/spec sheets/PDF links and prevents them unless consent has been granted.
            document.addEventListener('click', (e) => {
                const anchor = e.target.closest('a');
                if (anchor && anchor.href) {
                    const href = anchor.href.toLowerCase();
                    if (href.match(/\.(pdf|zip|dwg|dxf|cad|step|igs)$/)) {
                        const hasConsent = document.cookie.split('; ').some(row => row.startsWith('aura_consent=true'));
                        if (!hasConsent) {
                            e.preventDefault();
                            const existingRoot = document.getElementById('aura-consent-root');
                            if (!existingRoot) {
                                // Inject banner strictly
                                if (typeof injectConsentBanner === 'function') {
                                    injectConsentBanner(this.auraId, "POPIA", true);
                                }
                            } else {
                                alert("Please verify your business email in the bottom-right panel to download this technical resource.");
                            }
                        }
                    }
                }
            }, true);

            // Tab Visibility/Exit Sensors. Triggered when user switches tabs or exits the page.
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
        // Single Page Application (SPA) Patch:
        // Intercepts History state transitions so Next.js, React Router, or Nuxt client routing 
        // actions are captured as page entry touchpoints without requiring script reloads.
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

    /**
     * AuraOfflineQueue:
     * IndexedDB-based queue that stores telemetry events offline when connection is lost
     * and programmatically flushes them with recursive exponential backoff when connection is restored.
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
                        this.flush(); // Attempt flush on startup
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
                if (!this.db) {
                    resolve(false);
                    return;
                }
                try {
                    const transaction = this.db.transaction([this.storeName], 'readwrite');
                    const store = transaction.objectStore(this.storeName);
                    store.add({ endpoint, payload, timestamp: new Date().toISOString() });
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = () => resolve(false);
                } catch (e) {
                    resolve(false);
                }
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
                    if (!navigator.onLine) break; // Terminate early if we lose connection again
                    try {
                        const success = await AuraTracker.sendRaw(event.endpoint, event.payload);
                        if (success) {
                            await this.removeEvent(event.id);
                        } else {
                            throw new Error("Flush send raw failed");
                        }
                    } catch (e) {
                        this.isFlushing = false;
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

    const injectConsentBanner = (auraId, complianceMode, strictMode) => {
        // Prevent duplicate banner injections
        if (document.getElementById('aura-consent-root')) return;

        const container = document.createElement('div');
        container.id = 'aura-consent-root';
        document.body.appendChild(container);
        
        const shadow = container.attachShadow({ mode: 'closed' });
        
        // Premium industrial design styles & HTML layouts
        shadow.innerHTML = `
            <style>
                .aura-banner {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    background: rgba(17, 24, 39, 0.96);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #f3f4f6;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
                    font-family: system-ui, -apple-system, sans-serif;
                    z-index: 2147483647;
                    max-width: 360px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-sizing: border-box;
                }
                .aura-title {
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #fbbf24;
                    margin-bottom: 6px;
                }
                .aura-text {
                    font-size: 12px;
                    line-height: 1.5;
                    color: #d1d5db;
                    margin-bottom: 12px;
                }
                .aura-input {
                    width: 100%;
                    background: rgba(31, 41, 55, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 6px;
                    padding: 8px 12px;
                    color: #fff;
                    font-size: 12px;
                    margin-bottom: 10px;
                    box-sizing: border-box;
                    outline: none;
                }
                .aura-input:focus {
                    border-color: #fbbf24;
                }
                .aura-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 8px;
                    margin-bottom: 10px;
                }
                .aura-btn-primary {
                    background: #fbbf24;
                    color: #111827;
                    border: none;
                    border-radius: 6px;
                    padding: 9px 16px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    box-sizing: border-box;
                    transition: background 0.2s;
                }
                .aura-btn-primary:hover {
                    background: #f59e0b;
                }
            </style>
            <div class="aura-banner" id="aura-banner-container">
                <div class="aura-title">Forensic Consent Gate</div>
                <div class="aura-text" id="aura-banner-text">
                    ${strictMode ? 
                        "We noticed you are visiting from the EU. This site requests consent to perform industrial telemetry and browser diagnostics." : 
                        "AuraWorks performs quiet B2B analytics. Verify your enterprise identity to request technical specifications and CAD models."
                    }
                </div>
                
                <div id="aura-phase1-form">
                    ${strictMode ? `
                    <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                        <input type="checkbox" id="aura-consent-checkbox" style="margin-top: 3px; cursor: pointer;" />
                        <label for="aura-consent-checkbox" style="font-size: 11px; color: #d1d5db; line-height: 1.3; cursor: pointer; user-select: none;">
                            I consent to the collection of my browser configuration, canvas signature, and website telemetry.
                        </label>
                    </div>
                    ` : ''}
                    <input type="email" placeholder="Enter business email..." class="aura-input" id="aura-email-input" />
                    <button class="aura-btn-primary" id="aura-btn-accept" ${strictMode ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>Accept & Continue</button>
                </div>
                
                <div id="aura-phase2-form" style="display: none;">
                    <div class="aura-grid">
                        <input type="text" placeholder="Corporate role (e.g., procurement)..." class="aura-input" id="aura-role-input" />
                        <input type="text" placeholder="Direct phone number..." class="aura-input" id="aura-phone-input" />
                    </div>
                    <button class="aura-btn-primary" id="aura-btn-submit-phase2">Submit Verification</button>
                </div>
            </div>
        `;

        const acceptBtn = shadow.getElementById('aura-btn-accept');
        const emailInput = shadow.getElementById('aura-email-input');
        
        if (strictMode) {
            const consentCheckbox = shadow.getElementById('aura-consent-checkbox');
            consentCheckbox.addEventListener('change', () => {
                if (consentCheckbox.checked) {
                    acceptBtn.disabled = false;
                    acceptBtn.style.opacity = '1';
                    acceptBtn.style.cursor = 'pointer';
                } else {
                    acceptBtn.disabled = true;
                    acceptBtn.style.opacity = '0.5';
                    acceptBtn.style.cursor = 'not-allowed';
                }
            });
        }
        
        acceptBtn.addEventListener('click', async () => {
            const email = emailInput.value.trim();
            
            // Set consent cookie for 1 year
            const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
            document.cookie = `aura_consent=true; expires=${exp.toUTCString()}; path=/; SameSite=Lax; Secure`;
            
            if (email && email.includes('@')) {
                await AuraTracker.dispatch('identity', { email: email, capture_source: 'consent_banner_p1' });
            }
            
            if (strictMode) {
                // GDPR Mode: Enable tracking now
                AuraTracker.isArmed = true;
                AuraTracker.init(auraId);
                
                setTimeout(async () => {
                    const sig = await AuraFingerprint.getFullSignature();
                    await AuraTracker.dispatch('identity', { signature: sig });
                }, 1000);
            }
            
            // Transition banner state to Phase 02
            shadow.getElementById('aura-phase1-form').style.display = 'none';
            shadow.getElementById('aura-phase2-form').style.display = 'block';
            shadow.getElementById('aura-banner-text').innerText = "Please complete your corporate profile parameters to prioritize your queue access.";
        });
        
        // Handle Phase 02 Form
        const submitPhase2Btn = shadow.getElementById('aura-btn-submit-phase2');
        submitPhase2Btn.addEventListener('click', async () => {
            const role = shadow.getElementById('aura-role-input').value.trim();
            const phone = shadow.getElementById('aura-phone-input').value.trim();
            
            if (role || phone) {
                await AuraTracker.dispatch('identity', {
                    position: role,
                    phone: phone,
                    capture_source: 'consent_banner_p2'
                });
            }
            
            // Unmount banner gracefully
            container.remove();
        });

        // --- PHASE 02: Scroll Ceiling (50%) Trigger ---
        let hasUserExpandedPhase2 = false;
        window.addEventListener('scroll', () => {
            if (hasUserExpandedPhase2 || !container.parentNode) return;
            const scrollPct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            if (scrollPct >= 0.5) {
                hasUserExpandedPhase2 = true;
                shadow.getElementById('aura-phase1-form').style.display = 'none';
                shadow.getElementById('aura-phase2-form').style.display = 'block';
                shadow.getElementById('aura-banner-text').innerText = "Verify your corporate role and direct contact path to prioritize your connection.";
            }
        });

        // --- PHASE 03: Exit Intent Vector Trigger ---
        let hasShownExitIntent = false;
        document.addEventListener('mouseleave', (e) => {
            if (hasShownExitIntent || !container.parentNode || e.clientY >= 50) return;
            hasShownExitIntent = true;
            shadow.getElementById('aura-banner-text').innerText = "Leaving so soon? Register your business email to receive our weekly mining spec sheet reports.";
            shadow.getElementById('aura-phase1-form').style.display = 'block';
            shadow.getElementById('aura-phase2-form').style.display = 'none';
        });
    };

    const startAura = async () => {
        if (window.AURA_INITIALIZED) return;
        window.AURA_INITIALIZED = true;
        
        // Initialize offline database queue
        await AuraOfflineQueue.init();
        
        // 1. Fetch browser timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // 2. Fetch remote tracker configuration for client
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
            console.warn("AuraWorks: Failed to fetch remote config.", e);
        }
        
        // 3. Halt if client subscription is inactive
        if (config && config.is_active === false) {
            console.warn("AuraWorks: Client license inactive. Tracking halted.");
            return;
        }

        const auraId = await AuraPersistence.init();
        
        const requireConsent = config ? config.require_consent_banner : false;
        const complianceMode = config ? config.compliance_mode : "POPIA";
        
        const hasConsent = document.cookie.split('; ').some(row => row.startsWith('aura_consent=true'));
        
        if (requireConsent && !hasConsent) {
            if (complianceMode === "GDPR") {
                // Strict GDPR: Block telemetry tracking completely until consent is given
                AuraTracker.isArmed = false;
                injectConsentBanner(auraId, complianceMode, true);
            } else {
                // POPIA: Silent B2B tracking is active, but gate natural person details
                AuraTracker.isArmed = true;
                AuraTracker.init(auraId);
                injectConsentBanner(auraId, complianceMode, false);
            }
        } else {
            // Already consented or consent banner is bypassed
            AuraTracker.isArmed = true;
            AuraTracker.init(auraId);
            
            // Asynchronously dispatch hardware signature
            setTimeout(async () => {
                const sig = await AuraFingerprint.getFullSignature();
                await AuraTracker.dispatch('identity', { signature: sig });
            }, 2000);
        }
    };

    if (document.readyState === 'complete') startAura();
    else window.addEventListener('load', startAura);
})();