import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoosr.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/static/',
          '/admin/',
          '/convex/',
          // Block authenticated areas from public indexing
          '/dashboard/',
          '/design-studio/',
          '/onboarding/',
          '/test-widget/',
        ],
      },
      // Allow specific bots more access
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/en/',
          '/ar/',
          '/fr/',
          '/en/pricing',
          '/ar/pricing',
          '/fr/pricing',
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/dashboard/',
          '/design-studio/',
        ],
      },
      // Block AI crawlers from sensitive areas but allow main pages
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/en/',
          '/ar/',
          '/fr/',
          '/llms.txt',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/design-studio/',
          '/widget/',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/en/',
          '/ar/',
          '/fr/',
          '/llms.txt',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
