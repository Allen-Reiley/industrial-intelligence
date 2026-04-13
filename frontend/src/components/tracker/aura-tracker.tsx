"use client";

import { useEffect } from "react";

interface AuraTrackerProps {
  clientId: string;
  apiUrl?: string;
  cdnUrl?: string;
}

/**
 * AuraTracker: A modular forensic intelligence loader.
 * Injects the tracking script with cache-busting and configuration.
 */
export default function AuraTracker({
  clientId,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dynamic-flow-production-a5d6.up.railway.app",
  cdnUrl = "https://cdn.auraworks.co.za/aura.js",
}: AuraTrackerProps) {
  useEffect(() => {
    // 1. Initialize Global Configuration
    (window as any).AURA_CONFIG = { apiUrl };
    (window as any).AURA_ID = clientId;

    // 2. Create and Inject Script
    const script = document.createElement("script");
    script.async = true;
    
    // Hourly cache-busting (v parameter)
    const version = Math.floor(Date.now() / 3600000);
    script.src = `${cdnUrl}?v=${version}`;

    document.head.appendChild(script);

    return () => {
      // Clean up on unmount if necessary
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [clientId, apiUrl, cdnUrl]);

  return null; // This component doesn't render any UI
}