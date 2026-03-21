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
      ], 
    },
    sitemap: 'https://auraworks.co.za/sitemap.xml',
  };
}