"use client";

import { useEffect } from "react";

interface AuraTrackerProps {
  clientId: string;
  apiUrl?: string;
  cdnUrl?: string;
}

/**
 * AuraTracker: A modular forensic intelligence loader.
 * Injects the tracking script with multi-tenant identity mapping.
 */
export default function AuraTracker({
  clientId,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dynamic-flow-production-a5d6.up.railway.app",
  cdnUrl = "https://cdn.auraworks.co.za/aura.js",
}: AuraTrackerProps) {
  useEffect(() => {
    // 1. Global Config for forensic logic fallback
    (window as any).AURA_CONFIG = { apiUrl };
    (window as any).AURA_AGENCY_ID = clientId;

    // 2. Create and Inject Script
    const script = document.createElement("script");
    script.async = true;
    
    // Multi-tenant identification:
    // This matches the 'agencyId' lookup in aura.js
    script.setAttribute("data-id", clientId);
    
    // Hourly cache-busting (v parameter)
    const version = Math.floor(Date.now() / 3600000);
    script.src = `${cdnUrl}?v=${version}`;

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [clientId, apiUrl, cdnUrl]);

  return null;
}