/**
 * AuraWorks Industrial Intelligence Engine - Master Tracker
 */
(function() {
    const script = document.currentScript;
    const clientId = script.getAttribute('data-id');
    
    // --- DYNAMIC API RESOLUTION ---
    const getBaseUrl = () => {
        // 1. Check window config (Set in layout.tsx)
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        
        // 2. Fallback to script origin if loaded from Railway
        if (script && script.src.includes('http')) {
            try {
                return new URL(script.src).origin;
            } catch (e) {
                console.warn("AuraWorks: Could not parse script origin.");
            }
        }
        // 3. Local development fallback
        return "http://localhost:8000";
    };

    const BASE_URL = getBaseUrl().replace(/\/$/, '');
    
    // Path matches Swagger Docs: /api/v1/track
    const API_URL = `${BASE_URL}/api/v1/track`; 
    
    console.log(`🚀 AuraWorks Tracker Active. Engine: ${API_URL}`);

    let startTime = Date.now();
    let currentUrl = window.location.href;

    const trackEntry = () => {
        const entryPayload = {
            client_id: clientId,
            url: window.location.href,
            referrer: document.referrer || "direct", 
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            timestamp: new Date().toISOString()
        };

        console.log("📡 AuraWorks: Sending Entry Log...", entryPayload);

        fetch(`${API_URL}/entry`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryPayload),
            keepalive: true
        })
        .then(async response => {
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorBody}`);
            }
            return response.json();
        })
        .then(data => console.log("✅ AuraWorks: Entry Logged Successfully", data))
        .catch(err => console.error("❌ AuraWorks Entry Error:", err.message));
    };

    const trackExit = () => {
        const endTime = Date.now();
        const durationSeconds = Math.round((endTime - startTime) / 1000);

        const exitPayload = {
            client_id: clientId,
            url: currentUrl,
            duration: durationSeconds,
            event_type: "exit"
        };

        console.log("📡 AuraWorks: Sending Exit Log...", exitPayload);

        // Using sendBeacon for reliability on page close - No trailing slash
        const blob = new Blob([JSON.stringify(exitPayload)], { type: 'application/json' });
        const success = navigator.sendBeacon(`${API_URL}/exit`, blob);
        
        if (success) {
            console.log("📤 AuraWorks: Exit Beacon Queued");
        } else {
            console.warn("⚠️ AuraWorks: Exit Beacon failed to queue");
        }
    };

    // --- Execution Logic ---
    trackEntry();

    // SPA Navigation Handling (Next.js/React)
    const patchHistoryMethod = (method) => {
        const original = history[method];
        return function() {
            trackExit();
            const result = original.apply(this, arguments);
            currentUrl = window.location.href;
            startTime = Date.now();
            // Wrap in setTimeout to ensure the URL has updated before tracking entry
            setTimeout(trackEntry, 0);
            return result;
        };
    };

    history.pushState = patchHistoryMethod('pushState');
    history.replaceState = patchHistoryMethod('replaceState');

    window.addEventListener('popstate', () => {
        trackExit();
        currentUrl = window.location.href;
        startTime = Date.now();
        trackEntry();
    });

    // Track when user switches tabs or minimizes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            trackExit();
        } else {
            startTime = Date.now();
        }
    });

})();