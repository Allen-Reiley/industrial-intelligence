import { authFetch, authFetcher, getSessionToken, setSessionToken } from "./auth-fetch";

export { authFetch, authFetcher, getSessionToken, setSessionToken };

/**
 * The BASE_URL resolves the backend address.
 * In Production: https://api.auraworks.co.za
 * In Local: http://localhost:8000
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const cleanApiBase = BASE_URL.replace(/\/$/, '');

/**
 * Normalizes the API URL. 
 * Removes trailing slashes to prevent 307 Temporary Redirects or 404s in FastAPI.
 */
export const getEndpoint = (path: string) => {
    // Check if BASE_URL is valid to prevent silent failures
    if (!BASE_URL) {
        console.warn("⚠️ AuraWorks OS: NEXT_PUBLIC_API_URL is undefined.");
    }
    const cleanBase = BASE_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
    return `${cleanBase}/${cleanPath}`;
};

/**
 * Global authenticated API fetch client targeting NEXT_PUBLIC_API_URL.
 * Supports both relative paths ('/api/v1/...') and fully qualified URLs.
 */
export async function apiFetch(
    pathOrUrl: string | URL | Request,
    init: RequestInit = {}
): Promise<Response> {
    if (typeof pathOrUrl === 'string' && pathOrUrl.startsWith('/')) {
        return authFetch(getEndpoint(pathOrUrl), init);
    }
    return authFetch(pathOrUrl, init);
}

/**
 * Global SWR fetcher utility that automatically injects the Bearer session token.
 * Supports both relative paths ('/api/v1/...') and fully qualified URLs.
 */
export async function apiFetcher<T = any>(pathOrUrl: string): Promise<T> {
    const target = pathOrUrl.startsWith('/') ? getEndpoint(pathOrUrl) : pathOrUrl;
    return authFetcher<T>(target);
}

export async function submitToProspects(formData: Record<string, unknown>) {
    /**
     * Targets the updated v1/prospects/join endpoint.
     * Matches the backend route defined in app/api/v1/prospects.py
     */
    const endpoint = getEndpoint('api/v1/prospects/join');

    const clientId = process.env.NEXT_PUBLIC_WAITLIST_API_KEY || 
                     (typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>).AURA_AGENCY_ID : null);

    try {
        const response = await authFetch(endpoint, {
            method: 'POST',
            credentials: 'include',
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
    } catch (error: unknown) {
        console.error("🚨 API Dispatch Error:", error);
        throw error;
    }
}

export async function trackIntent(payload: {
    client_id: string;
    aura_id: string;
    vsl_completion_percentage: number;
    vsl_abandoned?: boolean;
}) {
    const endpoint = getEndpoint('api/v1/track/intent');
    try {
        const response = await authFetch(endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to track intent.');
        }

        return await response.json();
    } catch (error: unknown) {
        console.error("🚨 Intent Telemetry Error:", error);
        throw error;
    }
}