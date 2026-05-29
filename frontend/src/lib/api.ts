// src/lib/api.ts

/**
 * The BASE_URL resolves the backend address.
 * In Production: https://dynamic-flow-production-a5d6.up.railway.app
 * In Local: http://localhost:8000
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Normalizes the API URL. 
 * Removes trailing slashes to prevent 307 Temporary Redirects or 404s in FastAPI.
 */
const getEndpoint = (path: string) => {
    // Check if BASE_URL is valid to prevent silent failures
    if (!BASE_URL) {
        console.warn("⚠️ AuraWorks OS: NEXT_PUBLIC_API_URL is undefined.");
    }
    const cleanBase = BASE_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
    return `${cleanBase}/${cleanPath}`;
};

export async function submitToWaitlist(formData: any) {
    /**
     * Targets the updated v1/waitlist/join endpoint.
     * Matches the backend route defined in app/api/v1/waitlist.py
     */
    const endpoint = getEndpoint('api/v1/waitlist/join');

    // Fetch the client/tenant configuration key safely from environment bindings or window space
    const clientId = process.env.NEXT_PUBLIC_WAITLIST_API_KEY || 
                     (typeof window !== 'undefined' ? (window as any).AURA_AGENCY_ID : null);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...formData,
                /**
                 * THE TENANT ANCHOR:
                 * Explicitly assigns client_id to satisfy backend validation criteria.
                 */
                client_id: clientId,
                /**
                 * THE STITCH:
                 * Automatically grab the aura_id (forensic signature) from storage.
                 * This upgrades the anonymous session to a 'Consented' identity.
                 */
                aura_id: typeof window !== 'undefined' ? localStorage.getItem('aura_uid') : null,
                source: "industrial_intelligence_v1",
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            // Attempt to parse the structured error from FastAPI
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 404) {
                throw new Error(`Intelligence Gateway not found at ${endpoint}. Please verify backend deployment.`);
            }

            // Return the detailed error (e.g. 'Work email required')
            throw new Error(errorData.detail || 'The intelligence engine is currently synchronizing. Please try again.');
        }

        return await response.json();
    } catch (error: any) {
        console.error("🚨 API Dispatch Error:", error);
        throw error;
    }
}