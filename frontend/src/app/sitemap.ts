// frontend/src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://auraworks.co.za';

  // For now, these are your manual routes. 
  // Later, you can fetch dynamic slugs from your database/API here.
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Add other planned pages here (e.g., /services, /contact)
  ];
}