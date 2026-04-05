// src/lib/api.ts

/**
 * The BASE_URL resolves the backend address.
 * Ensure NEXT_PUBLIC_API_URL is set in your .env.local or production environment.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Normalizes the API URL. 
 * Removes trailing and leading slashes to prevent standard FastAPI route mismatches.
 */
const getEndpoint = (path: string) => {
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

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
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
        
        // Logical Check: If the route is missing entirely
        if (response.status === 404) {
            throw new Error(`Intelligence Gateway not found at ${endpoint}. Please verify backend deployment.`);
        }

        // Return the detailed error (e.g. 'Work email required') or a generic fallback
        throw new Error(errorData.detail || 'The intelligence engine is currently synchronizing. Please try again.');
    }

    return response.json();
}