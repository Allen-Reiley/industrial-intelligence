/**
 * AuraWorks Industrial Intelligence Engine - Master Tracker
 */
(function() {
    const script = document.currentScript;
    const clientId = script.getAttribute('data-id');
    
    // --- DYNAMIC API RESOLUTION ---
    // First try the injected config, then fallback to current domain, then localhost
    const getBaseUrl = () => {
        if (window.AURA_CONFIG?.apiUrl) return window.AURA_CONFIG.apiUrl;
        
        // Fallback: If script is loaded from a remote server, use that server's origin
        if (script && script.src.includes('http')) {
            return new URL(script.src).origin;
        }
        return "http://localhost:8000";
    };

    const BASE_URL = getBaseUrl().replace(/\/$/, '');
    // Synchronize this with your FastAPI route prefix
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

        fetch(`${API_URL}/entry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryPayload),
            keepalive: true
        }).catch(err => console.error("Tracking Error (Entry):", err));
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

        const blob = new Blob([JSON.stringify(exitPayload)], { type: 'application/json' });
        navigator.sendBeacon(`${API_URL}/exit`, blob);
    };

    // --- Execution & SPA Logic ---
    trackEntry();

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

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            trackExit();
        } else {
            startTime = Date.now();
        }
    });

})();