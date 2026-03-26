// src/lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Normalizes the API URL and ensures the trailing slash for FastAPI
 */
const getEndpoint = (path: string) => {
    const cleanBase = BASE_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
    return `${cleanBase}/${cleanPath}/`;
};

export async function submitToWaitlist(formData: any) {
    const response = await fetch(getEndpoint('api/v1/waitlist'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
            source: "industrial_intelligence_v1",
            timestamp: new Date().toISOString()
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to connect to the intelligence engine.');
    }

    return response.json();
}