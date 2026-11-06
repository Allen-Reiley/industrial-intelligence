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
    if (!BASE_URL) {
        console.warn("⚠️ AuraWorks OS: NEXT_PUBLIC_API_URL is undefined.");
    }
    const cleanBase = BASE_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
    return `${cleanBase}/${cleanPath}`;
};

/**
 * Global API fetch client targeting NEXT_PUBLIC_API_URL.
 */
export async function apiFetch(
    pathOrUrl: string | URL | Request,
    init: RequestInit = {}
): Promise<Response> {
    const target = typeof pathOrUrl === 'string' && pathOrUrl.startsWith('/')
        ? getEndpoint(pathOrUrl)
        : pathOrUrl;
    return fetch(target, {
        credentials: 'include',
        ...init,
    });
}

export async function submitToProspects(formData: Record<string, unknown>) {
    /**
     * Targets the updated v1/prospects/join endpoint.
     * Matches the backend route defined in app/api/v1/prospects.py
     */
    const endpoint = getEndpoint('api/v1/prospects/join');

    const clientId = 
        process.env.NEXT_PUBLIC_WAITLIST_API_KEY || 
        (typeof window !== 'undefined' ? (window as any).AURA_ID || (window as any).AURA_AGENCY_ID : null) || 
        'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0';

    try {
        const response = await fetch(endpoint, {
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
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 404) {
                throw new Error(`Intelligence Gateway not found at ${endpoint}. Please verify backend deployment.`);
            }

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
        const response = await fetch(endpoint, {
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
