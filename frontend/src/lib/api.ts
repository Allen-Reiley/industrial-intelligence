// src/lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Normalizes the API URL. 
 * Removed the forced trailing slash to stay compatible with standard FastAPI routes.
 */
const getEndpoint = (path: string) => {
    const cleanBase = BASE_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
    return `${cleanBase}/${cleanPath}`;
};

export async function submitToWaitlist(formData: any) {
    // Added '/join' to match your FastAPI router logic
    const endpoint = getEndpoint('api/v1/waitlist/join');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
            // Automatically grab the aura_id from storage for the "Stitch"
            aura_id: typeof window !== 'undefined' ? localStorage.getItem('aura_uid') : null,
            source: "industrial_intelligence_v1",
            timestamp: new Date().toISOString()
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Providing a clearer error if the backend returns a 404
        if (response.status === 404) {
            throw new Error(`Endpoint not found at ${endpoint}. Check your API URL.`);
        }
        throw new Error(errorData.detail || 'Failed to connect to the intelligence engine.');
    }

    return response.json();
}