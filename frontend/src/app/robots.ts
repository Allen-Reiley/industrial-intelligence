import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const disallowedPaths = [
    '/aurahq/',     // Internal lead dashboard and admin console
    '/api/',        // Ingestion & auth API endpoints
    '/checkout',    // Transactional checkout gate
    '/thank-you',   // Post-conversion onboarding screen
    '/403',         // Error pages
    '/500', 
    '/admin/',
    '/dashboard/',
    '/private/',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'Google-Extended',
          'ClaudeBot',
          'anthropic-ai',
        ],
        allow: '/',
        disallow: disallowedPaths,
      },
    ],
    sitemap: 'https://auraworks.co.za/sitemap.xml',
  };
}

