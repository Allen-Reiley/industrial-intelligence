/**
 * AuraWorks Industrial Intelligence Engine - Unified Master Tracker
 * Version: 2.1.0 (Debug & Forensic Edition)
 * For reference purposes, aura.js is used.
 */
(function() {
    const script = document.currentScript;
    const clientId = script.getAttribute('data-id');
    
    // --- 1. CONFIGURATION & API RESOLUTION ---
    const getBaseUrl = () => {
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        if (script && script.src.includes('http')) {
            try { return new URL(script.src).origin; } catch (e) {}
        }
        return "http://localhost:8000";
    };

    const BASE_URL = getBaseUrl().replace(/\/$/, '');
    const API_URL = `${BASE_URL}/api/v1/track`; 
    
    console.log(`🚀 AuraWorks Tracker Active. Client: ${clientId} | Engine: ${API_URL}`);

    let startTime = Date.now();
    let currentUrl = window.location.href;
    const honeyPotId = 'aura-v-check';

    // --- 2. CORE DISPATCHER ---
    const auraDispatch = async (endpoint, payload, useBeacon = false) => {
        const fullPayload = {
            client_id: clientId,
            aura_id: localStorage.getItem('aura_uid') || 'anonymous',
            timestamp: new Date().toISOString(),
            ...payload
        };

        if (useBeacon && navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(fullPayload)], { type: 'application/json' });
            const success = navigator.sendBeacon(`${API_URL}/${endpoint}`, blob);
            if (success) console.log(`📤 AuraWorks: Exit Beacon Queued [${endpoint}]`);
            return success;
        }

        console.log(`📡 AuraWorks: Sending ${endpoint.toUpperCase()} Log...`, fullPayload);

        try {
            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullPayload),
                keepalive: true
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            console.log(`✅ AuraWorks: ${endpoint.toUpperCase()} Logged Successfully`, data);
            return data;
        } catch (err) {
            console.error(`❌ AuraWorks [${endpoint}] Error:`, err.message);
        }
    };

    // --- 3. SENSORS: BLUR, HONEYPOT, SCROLL ---
    const initSensors = () => {
        // A. Blur Capture (The Money)
        document.querySelectorAll('input[type="email"], input[name*="email"]').forEach(input => {
            input.addEventListener('blur', (e) => {
                if (e.target.value.includes('@')) {
                    console.log("💰 AuraWorks: Capturing Partial Lead (Blur Event)...");
                    auraDispatch('event', { 
                        event_type: 'blur_capture', 
                        captured_email: e.target.value,
                        field_id: e.target.id || e.target.name
                    });
                }
            });
        });

        // B. Honey Pot (Bot Filter)
        const hp = document.getElementById(honeyPotId);
        if (hp) {
            hp.addEventListener('click', (e) => {
                e.preventDefault();
                console.warn("🛡️ AuraWorks: Bot Triggered Honey Pot!");
                auraDispatch('event', { is_bot: true, event_type: 'bot_trigger' });
            });
        }

        // C. Scroll Depth (Intent Sensor)
        let scrollFired = false;
        window.addEventListener('scroll', () => {
            if (scrollFired) return;
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrolled > 30) {
                console.log("📈 AuraWorks: High Intent Detected (Scroll > 30%)");
                auraDispatch('event', { event_type: 'high_intent', scroll_depth: Math.round(scrolled) });
                scrollFired = true;
            }
        }, { passive: true });
    };

    // --- 4. LIFE CYCLE LOGIC ---
    const trackEntry = () => {
        auraDispatch('entry', {
            url: window.location.href,
            referrer: document.referrer || "direct",
            screen_res: `${window.screen.width}x${window.screen.height}`
        });
        initSensors(); 
    };

    const trackExit = () => {
        const duration = Math.round((Date.now() - startTime) / 1000);
        auraDispatch('exit', {
            url: currentUrl,
            duration: duration
        }, true); 
    };

    // --- 5. SPA & VISIBILITY HANDLING ---
    const patchHistory = (method) => {
        const original = history[method];
        return function() {
            trackExit();
            const result = original.apply(this, arguments);
            currentUrl = window.location.href;
            startTime = Date.now();
            setTimeout(trackEntry, 0);
            return result;
        };
    };

    history.pushState = patchHistory('pushState');
    history.replaceState = patchHistory('replaceState');
    window.addEventListener('popstate', () => { 
        trackExit(); 
        currentUrl = window.location.href;
        startTime = Date.now();
        trackEntry(); 
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            trackExit();
        } else {
            console.log("🔄 AuraWorks: Tab Focused - Restarting Timer");
            startTime = Date.now();
        }
    });

    // --- INITIALIZE ---
    trackEntry();
})();