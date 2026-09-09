import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/aurahq/',     // Internal lead dashboard and admin console
        '/api/',        // Ingestion & auth API endpoints
        '/checkout',    // Transactional checkout gate
        '/thank-you',   // Post-conversion onboarding screen
        '/403',         // Error pages
        '/500', 
        '/admin/',
        '/dashboard/',
        '/private/',
      ],
    },
    sitemap: 'https://auraworks.co.za/sitemap.xml',
  };
}
