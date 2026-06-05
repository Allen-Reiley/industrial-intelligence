/**
 * AuraWorks API Communication Module
 * Native window.fetch() client for tracker endpoints.
 * Separated from frontend/React dependencies to allow clean CDN distribution.
 */

const API_VERSION = "/api/v1";

export class AuraApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    /**
     * Fetches client-specific configuration and compliance routing instructions.
     * Verifies the strict domain registry and passes the client timezone.
     */
    async getClientConfig(clientId, timezone) {
        const url = `${this.baseUrl}${API_VERSION}/clients/config?client_id=${clientId}&tz=${encodeURIComponent(timezone)}`;
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} (Client configuration lookup failed)`);
        }
        return await response.json();
    }

    /**
     * Dispatches page view/entry telemetry events.
     */
    async postEntry(clientId, auraId, payload) {
        const url = `${this.baseUrl}${API_VERSION}/track/entry`;
        return this._post(url, { client_id: clientId, aura_id: auraId, ...payload });
    }

    /**
     * Dispatches exit events. Uses navigator.sendBeacon as a fallback to ensure 
     * delivery during page unload/destruction events.
     */
    async postExit(clientId, auraId, payload) {
        const url = `${this.baseUrl}${API_VERSION}/track/exit`;
        return this._post(url, { client_id: clientId, aura_id: auraId, ...payload }, true);
    }

    /**
     * Dispatches custom behavioral events (clicks, specs view, scroll milestones).
     */
    async postEvent(clientId, auraId, payload) {
        const url = `${this.baseUrl}${API_VERSION}/track/event`;
        return this._post(url, { client_id: clientId, aura_id: auraId, ...payload });
    }

    /**
     * Dispatches identity/demographic mappings (blur fields, warm leads consent inputs).
     */
    async postIdentity(clientId, auraId, payload) {
        const url = `${this.baseUrl}${API_VERSION}/track/identity`;
        return this._post(url, { client_id: clientId, aura_id: auraId, ...payload });
    }

    /**
     * Internal post dispatch wrapper handling CORS context and browser keepalive flags.
     */
    async _post(url, payload, useBeacon = false) {
        const bodyStr = JSON.stringify({
            timestamp: new Date().toISOString(),
            ...payload
        });

        if (useBeacon && navigator.sendBeacon) {
            const blob = new Blob([bodyStr], { type: 'application/json' });
            const success = navigator.sendBeacon(url, blob);
            if (success) return { status: "beacon_sent" };
        }

        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: bodyStr,
            keepalive: true
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return await response.json();
    }
}
