/**
 * Industrial Intelligence Engine - Master Tracker
 * Usage: <script src="https://api.yourdomain.com/tracker.js" data-id="CLIENT_ID_HERE"></script>
 */
(function() {
    // 1. Configuration & Setup
    const script = document.currentScript;
    const clientId = script.getAttribute('data-id');
    const baseUrl = "https://api.yourdomain.com/v1/track"; // Ensure this matches your FastAPI backend
    const startTime = Date.now();
    
    // 2. Data Collection (The "Fingerprint")
    // We capture this immediately to identify the business.
    const entryPayload = {
        client_id: clientId,
        url: window.location.href,
        referrer: document.referrer || "direct", // Tracks where they came from (Google, LinkedIn, etc.)
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
    };

    // 3. Send the "Entry" Ping
    // We use 'fetch' here to ensure the session is created in your DB.
    // 'keepalive: true' ensures the request completes even if the page unloads immediately.
    fetch(`${baseUrl}/entry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryPayload),
        keepalive: true
    }).catch(err => console.error("Tracking Error:", err));

    // 4. Track Duration & Exit (The "Behavior")
    // This listener fires when the user closes the tab, switches apps, or minimizes the window.
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            const endTime = Date.now();
            // Calculate time in seconds (rounded)
            const durationSeconds = Math.round((endTime - startTime) / 1000);

            const exitPayload = {
                client_id: clientId,
                url: window.location.href,
                duration: durationSeconds,
                event_type: "exit"
            };

            // 5. Send the "Exit" Ping
            // navigator.sendBeacon is critical here. It sends data asynchronously 
            // without delaying the browser from closing the page.
            const blob = new Blob([JSON.stringify(exitPayload)], { type: 'application/json' });
            navigator.sendBeacon(`${baseUrl}/exit`, blob);
        }
    });
})();