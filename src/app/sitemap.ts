import type { MetadataRoute } from 'next';

// Static page lastModified dates — update when content actually changes
const pageLastModified: Record<string, string> = {
  '/': '2025-04-01',
  '/pricing': '2025-04-01',
  '/waitlist': '2025-03-15',
  '/legal/privacy': '2025-03-01',
  '/legal/terms': '2025-03-01',
  '/solutions/customer-service': '2025-04-01',
  '/solutions/marketing': '2025-04-01',
  '/solutions/ecommerce': '2025-04-01',
  '/solutions/education': '2025-04-01',
  '/products/design-studio': '2025-04-01',
  '/products/knowledge-base': '2025-04-01',
  '/products/integrations': '2025-04-01',
  '/products/analytics': '2025-04-01',
  '/design-studio': '2025-04-01',
};

function getLastModified(path: string): Date {
  const date = pageLastModified[path] || pageLastModified['/'];
  return new Date(date);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoosr.io';
  const locales = ['en', 'ar', 'fr'];

  // Public marketing pages (excluding auth pages with no SEO value)
  const publicPages = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/pricing', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/waitlist', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/legal/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/legal/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  const publicUrls = locales.flatMap((locale) =>
    publicPages.map((page) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: getLastModified(page.path),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  // Solutions pages (hardcoded slugs from solutions/[slug]/page.tsx)
  const solutionSlugs = ['customer-service', 'marketing', 'ecommerce', 'education'];
  const solutionUrls = locales.flatMap((locale) =>
    solutionSlugs.map((slug) => ({
      url: `${baseUrl}/${locale}/solutions/${slug}`,
      lastModified: getLastModified(`/solutions/${slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // Products pages (hardcoded slugs from products/[slug]/page.tsx)
  const productSlugs = ['design-studio', 'knowledge-base', 'integrations', 'analytics'];
  const productUrls = locales.flatMap((locale) =>
    productSlugs.map((slug) => ({
      url: `${baseUrl}/${locale}/products/${slug}`,
      lastModified: getLastModified(`/products/${slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // Design Studio (entry point, not per-bot pages)
  const designStudioUrls = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/design-studio`,
    lastModified: getLastModified('/design-studio'),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    // Only locale-prefixed URLs (Google indexes these, not bare root)
    // Root / redirects to /en so we list /en as canonical entry point
    ...publicUrls,
    ...solutionUrls,
    ...productUrls,
    ...designStudioUrls,
  ];
}
