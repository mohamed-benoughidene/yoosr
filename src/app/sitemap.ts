import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoosr.com';
  const locales = ['en', 'ar', 'fr'];

  // Static pages available in each locale
  const staticPages = [
    '',
    '/pricing',
    '/waitlist',
    '/login',
    '/signup',
    '/onboarding',
    '/legal/privacy',
    '/legal/terms',
  ];

  // Generate URLs for all locales and static pages
  const staticUrls = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  );

  // Dashboard pages (authenticated - lower priority, still indexable for logged-in users)
  const dashboardPages = [
    '/dashboard',
    '/dashboard/monitor',
    '/dashboard/chat',
    '/dashboard/bots',
    '/dashboard/analytics',
    '/dashboard/contacts',
    '/dashboard/requests',
    '/dashboard/history',
    '/dashboard/activities',
    '/dashboard/apps',
    '/dashboard/kb',
    '/dashboard/settings',
  ];

  const dashboardUrls = locales.flatMap((locale) =>
    dashboardPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  );

  // Design studio pages
  const designStudioUrls = locales.flatMap((locale) => ({
    url: `${baseUrl}/${locale}/design-studio`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Marketing/landing page sections (anchor links)
  const landingSections = [
    '/#home',
    '/#features',
    '/#studio',
    '/#how-it-works',
    '/#who-its-for',
    '/#trust-signals',
    '/#pricing',
    '/#channels',
  ];

  const landingSectionUrls = locales.flatMap((locale) =>
    landingSections.map((section) => ({
      url: `${baseUrl}/${locale}${section}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  return [
    // Homepage has highest priority
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...staticUrls,
    ...dashboardUrls,
    ...designStudioUrls,
    ...landingSectionUrls,
  ];
}
