/**
 * AuraWorks Industrial Intelligence Engine - Master Tracker
 */
(function() {
    const script = document.currentScript;
    const clientId = script.getAttribute('data-id');
    
    // --- DYNAMIC API RESOLUTION ---
    const getBaseUrl = () => {
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        
        // If script is loaded from Railway, use that origin
        if (script && script.src.includes('http')) {
            try {
                return new URL(script.src).origin;
            } catch (e) {
                console.warn("AuraWorks: Could not parse script origin, falling back.");
            }
        }
        // Local development fallback
        return "http://localhost:8000";
    };

    const BASE_URL = getBaseUrl().replace(/\/$/, '');
    
    // Matches: app.include_router(track.router, prefix=f"{settings.API_V1_STR}/track")
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
            // Sent as ISO string; VisitBase model now handles this as Optional[str]
            timestamp: new Date().toISOString()
        };

        fetch(`${API_URL}/entry`, {
            method: 'POST',
            mode: 'cors', // Explicitly signal CORS
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryPayload),
            keepalive: true
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => console.log("✅ AuraWorks: Entry Logged", data))
        .catch(err => console.error("❌ AuraWorks Tracking Error (Entry):", err));
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

        // Use sendBeacon for reliability on page close
        const blob = new Blob([JSON.stringify(exitPayload)], { type: 'application/json' });
        navigator.sendBeacon(`${API_URL}/exit`, blob);
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