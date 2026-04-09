/**
 * Industrial Intelligence Engine - Master Tracker (v2 SPA Support)
 * Usage: <script src="https://cdn.yourdomain.com/tracker.js" data-id="CLIENT_ID_HERE"></script>
 * This tracker is rendered obsolete, aura.js is what's being used
*/
(function() {
    // 1. Configuration & Setup
    const script = document.currentScript;
    const clientId = script.getAttribute('data-id');
    // Ensure this matches your FastAPI backend
    const API_URL = "http://localhost:8000/v1/track"; 
    
    // State Variables (Changed from const to let to allow resetting on navigation)
    let startTime = Date.now();
    let currentUrl = window.location.href;

    // --- Core Function: Send Entry Ping ---
    // Captures the new page details immediately
    const trackEntry = () => {
        const entryPayload = {
            client_id: clientId,
            url: window.location.href, // Always gets the *current* browser URL
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

    // --- Core Function: Send Exit Ping ---
    // Calculates duration for the SPECIFIC page being left
    const trackExit = () => {
        const endTime = Date.now();
        const durationSeconds = Math.round((endTime - startTime) / 1000);

        // Filter out zero-second bounces if desired, or keep raw data
        const exitPayload = {
            client_id: clientId,
            url: currentUrl, // Send the URL of the page we are *leaving*
            duration: durationSeconds,
            event_type: "exit"
        };

        const blob = new Blob([JSON.stringify(exitPayload)], { type: 'application/json' });
        navigator.sendBeacon(`${API_URL}/exit`, blob);
    };

    // --- 2. Initial Execution ---
    // Fire immediately on the very first script load
    trackEntry();

    // --- 3. Single Page Application (SPA) Logic ---
    // Frameworks like Next.js/React use History API (pushState) instead of real page loads.
    // We must "patch" these methods to detect when the URL changes.

    const patchHistoryMethod = (method) => {
        const original = history[method];
        return function() {
            // A. Before navigation: Close the session for the CURRENT page
            trackExit();

            // B. Execute the actual framework navigation
            const result = original.apply(this, arguments);

            // C. After navigation: Start new session for the NEW page
            currentUrl = window.location.href;
            startTime = Date.now();
            
            // We wrap this in a tiny timeout to ensure window.location is fully updated
            setTimeout(trackEntry, 0);

            return result;
        };
    };

    // Monkey-patch the history methods
    history.pushState = patchHistoryMethod('pushState');       // Handles normal link clicks
    history.replaceState = patchHistoryMethod('replaceState'); // Handles redirects/rewrites

    // Listen for the "Back" and "Forward" browser buttons
    window.addEventListener('popstate', () => {
        trackExit(); // Close old page
        currentUrl = window.location.href;
        startTime = Date.now();
        trackEntry(); // Open new page
    });

    // --- 4. Traditional Visibility Tracking ---
    // Still critical for when users minimize the tab or close the browser entirely
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            trackExit();
        } else {
            // Optional: If user comes back to the tab, you could reset startTime here
            // to avoid counting "tab background time" as active viewing time.
            startTime = Date.now();
        }
    });

})();