import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoosr.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/en/',
          '/ar/',
          '/fr/',
        ],
        disallow: [
          '/', // Block bare root (redirect source — wastes crawl budget)
          '/_next/data/', // Block internal Next.js JSON files (crawl budget)
          '/dashboard',
          '/design-studio',
          '/api',
          '/widget',
          '/login',
          '/signup',
          '/onboarding',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/en/',
          '/ar/',
          '/fr/',
        ],
        disallow: [
          '/', // Block bare root (redirect source — wastes crawl budget)
          '/_next/data/', // Block internal Next.js JSON files (crawl budget)
          '/dashboard',
          '/design-studio',
          '/api',
          '/widget',
          '/login',
          '/signup',
          '/onboarding',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
