import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Prevent bots from crawling your lead-gen dashboard or internal API
      disallow: [
        '/private/',
        '/dashboard/', 
        '/api/',
        '/403',        // No need to index error pages
        '/500', 
        '/admin/',
      ], 
    },
    sitemap: 'https://auraworks.co.za/sitemap.xml',
  };
}