import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoosr.co';
  const locales = ['en', 'ar', 'fr'];

  // Public marketing pages
  const publicPages = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/pricing', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/waitlist', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/login', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/signup', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/onboarding', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/legal/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/legal/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  const publicUrls = locales.flatMap((locale) =>
    publicPages.map((page) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  // Solutions pages (hardcoded slugs from solutions/[slug]/page.tsx)
  const solutionSlugs = ['customer-service', 'marketing', 'ecommerce', 'education'];
  const solutionUrls = locales.flatMap((locale) =>
    solutionSlugs.map((slug) => ({
      url: `${baseUrl}/${locale}/solutions/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // Products pages (hardcoded slugs from products/[slug]/page.tsx)
  const productSlugs = ['design-studio', 'knowledge-base', 'integrations', 'analytics'];
  const productUrls = locales.flatMap((locale) =>
    productSlugs.map((slug) => ({
      url: `${baseUrl}/${locale}/products/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // Design Studio (entry point, not per-bot pages)
  const designStudioUrls = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/design-studio`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    // Homepage (no locale prefix) — highest priority
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...publicUrls,
    ...solutionUrls,
    ...productUrls,
    ...designStudioUrls,
  ];
}
