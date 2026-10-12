// frontend/src/lib/auth-fetch.ts
import { authClient } from "./auth-client";

/**
 * Retrieves the active session token from browser storage, cookies, or Better Auth client.
 */
export async function getSessionToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  // 1. Check localStorage / sessionStorage
  try {
    const stored =
      localStorage.getItem("better-auth.session_token") ||
      sessionStorage.getItem("better-auth.session_token") ||
      localStorage.getItem("admin_token");
    if (stored && stored.trim()) {
      return stored.trim();
    }
  } catch {
    // Ignore storage access errors
  }

  // 2. Check document.cookie
  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.trim().split("=");
      const val = rest.join("=");
      if (
        [
          "better-auth.session_token",
          "__Secure-better-auth.session_token",
          "aura_session_token",
          "admin_access_token",
          "aurahq_auth",
        ].includes(name) &&
        val
      ) {
        const decoded = decodeURIComponent(val.trim());
        if (decoded) {
          // Cache in localStorage for subsequent fast synchronous reads
          try {
            localStorage.setItem("better-auth.session_token", decoded);
          } catch {}
          return decoded;
        }
      }
    }
  } catch {
    // Ignore cookie read errors
  }

  // 3. Query Better Auth client session
  try {
    const sessionRes = await authClient.getSession();
    const token =
      (sessionRes as any)?.data?.session?.token ||
      (sessionRes as any)?.session?.token ||
      (sessionRes as any)?.token;
    if (token) {
      try {
        localStorage.setItem("better-auth.session_token", token);
        document.cookie = `aura_session_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      } catch {}
      return token;
    }
  } catch {
    // Ignore network/session errors
  }

  return null;
}

/**
 * Synchronous token extractor for situations where async token lookup cannot be awaited.
 */
export function getSessionTokenSync(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const stored =
      localStorage.getItem("better-auth.session_token") ||
      sessionStorage.getItem("better-auth.session_token") ||
      localStorage.getItem("admin_token");
    if (stored && stored.trim()) {
      return stored.trim();
    }
  } catch {}

  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.trim().split("=");
      const val = rest.join("=");
      if (
        [
          "better-auth.session_token",
          "__Secure-better-auth.session_token",
          "aura_session_token",
          "admin_access_token",
          "aurahq_auth",
        ].includes(name) &&
        val
      ) {
        return decodeURIComponent(val.trim());
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

  if (token) {
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("x-session-token")) {
      headers.set("x-session-token", token);
    }
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
