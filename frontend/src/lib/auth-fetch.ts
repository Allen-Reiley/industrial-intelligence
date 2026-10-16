// frontend/src/lib/auth-fetch.ts
import { authClient, getSession } from "./auth-client";

let inMemoryToken: string | null = null;
let activeSessionFetch: Promise<string | null> | null = null;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const cleanApiBase = API_BASE.replace(/\/$/, "");

/**
 * Explicitly sets or clears the session token across in-memory cache,
 * localStorage, sessionStorage, and root subdomain cookies (.auraworks.co.za).
 */
export function setSessionToken(token: string | null) {
  if (typeof window === "undefined") return;
  const hostname = window.location.hostname;
  const isApexOrSubdomain = hostname.includes("auraworks.co.za");
  const rootDomain = isApexOrSubdomain ? "; domain=.auraworks.co.za" : "";
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";

  if (!token) {
    inMemoryToken = null;
    try {
      localStorage.removeItem("better-auth.session_token");
      sessionStorage.removeItem("better-auth.session_token");
      localStorage.removeItem("aura_session_token");
      sessionStorage.removeItem("aura_session_token");
      document.cookie = `aura_session_token=; path=/; max-age=0; SameSite=Lax${secureFlag}${rootDomain}`;
    } catch {}
    return;
  }

  const clean = token.trim();
  inMemoryToken = clean;
  try {
    localStorage.setItem("better-auth.session_token", clean);
    sessionStorage.setItem("better-auth.session_token", clean);
    document.cookie = `aura_session_token=${encodeURIComponent(clean)}; path=/; max-age=604800; SameSite=Lax${secureFlag}${rootDomain}`;
  } catch {}
}

/**
 * Actively retrieves the active session token from Better Auth,
 * falling back to local storage caches if needed.
 */
export async function getSessionToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  // 1. Actively query Better Auth client getSession()
  try {
    const sessionGetter =
      typeof authClient?.getSession === "function"
        ? authClient.getSession
        : typeof getSession === "function"
        ? getSession
        : null;

    if (sessionGetter) {
      // Deduplicate concurrent getSession calls
      if (!activeSessionFetch) {
        activeSessionFetch = sessionGetter()
          .then((sessionRes: any) => {
            const token =
              sessionRes?.data?.session?.token ||
              sessionRes?.data?.token ||
              sessionRes?.session?.token ||
              sessionRes?.token;

            if (token && typeof token === "string" && token.trim()) {
              const clean = token.trim();
              setSessionToken(clean);
              return clean;
            }
            return null;
          })
          .catch((err: any) => {
            console.warn("⚠️ [auth-fetch] authClient.getSession() call failed:", err);
            return null;
          })
          .finally(() => {
            activeSessionFetch = null;
          });
      }

      const activeToken = await activeSessionFetch;
      if (activeToken) {
        return activeToken;
      }
    }
  } catch (err) {
    console.warn("⚠️ [auth-fetch] getSessionToken error:", err);
  }

  // 2. Fallback to memory cache
  if (inMemoryToken) {
    return inMemoryToken;
  }

  // 3. Fallback to storage (sessionStorage first, then localStorage)
  try {
    const stored =
      sessionStorage.getItem("better-auth.session_token") ||
      localStorage.getItem("better-auth.session_token") ||
      sessionStorage.getItem("aura_session_token") ||
      localStorage.getItem("aura_session_token");
    if (stored && stored.trim()) {
      inMemoryToken = stored.trim();
      return inMemoryToken;
    }
  } catch {}

  // 4. Fallback to cookie (custom aura_session_token)
  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.trim().split("=");
      const val = rest.join("=");
      if (name === "aura_session_token" && val) {
        const decoded = decodeURIComponent(val.trim());
        if (decoded) {
          inMemoryToken = decoded;
          return decoded;
        }
      }
    }
  } catch {}

  return null;
}

/**
 * Synchronous token extractor for situations where async token lookup cannot be awaited.
 */
export function getSessionTokenSync(): string | null {
  if (typeof window === "undefined") return null;

  if (inMemoryToken) return inMemoryToken;

  try {
    const stored =
      sessionStorage.getItem("better-auth.session_token") ||
      localStorage.getItem("better-auth.session_token") ||
      sessionStorage.getItem("aura_session_token") ||
      localStorage.getItem("aura_session_token");
    if (stored && stored.trim()) {
      inMemoryToken = stored.trim();
      return inMemoryToken;
    }
  } catch {}

  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.trim().split("=");
      const val = rest.join("=");
      if (name === "aura_session_token" && val) {
        const decoded = decodeURIComponent(val.trim());
        if (decoded) {
          inMemoryToken = decoded;
          return decoded;
        }
      }
    }
  } catch {}

  return null;
}

/**
 * Authenticated fetch wrapper that automatically attaches the Bearer token
 * to the Authorization header and enables credentials: "include".
 * 
 * Bridges cross-subdomain calls (e.g. www.auraworks.co.za -> api.auraworks.co.za)
 * where browsers drop cross-subdomain cookies.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = await getSessionToken();
  const headers = new Headers(init.headers || {});

  const urlString =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : (input as Request).url || "";

  if (token) {
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("x-session-token")) {
      headers.set("x-session-token", token);
    }
  } else {
    if (urlString.includes(cleanApiBase) || urlString.startsWith("/api/v1")) {
      console.warn("⚠️ [authFetch] Outgoing request to backend without session token:", urlString);
    }
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  return fetch(input, {
    ...init,
    credentials: init.credentials || "include",
    headers,
  });
}

/**
 * SWR fetcher utility that automatically injects the Bearer session token.
 */
export async function authFetcher<T = any>(url: string): Promise<T> {
  const res = await authFetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(
      errorData.detail || errorData.message || `Request failed with status ${res.status}`
    );
    (error as any).status = res.status;
    (error as any).info = errorData;
    throw error;
  }
  return res.json();
}

export const apiFetch = authFetch;
export const apiFetcher = authFetcher;

