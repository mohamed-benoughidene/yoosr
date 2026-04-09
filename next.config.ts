import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */

  turbopack: {
    root: __dirname,
  },

  async redirects() {
    return [
      // Redirect root SEO files to default locale
      {
        source: '/sitemap.xml',
        destination: '/en/sitemap.xml',
        permanent: true,
      },
      {
        source: '/robots.txt',
        destination: '/en/robots.txt',
        permanent: true,
      },
      {
        source: '/llms.txt',
        destination: '/en/llms.txt',
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.convex.cloud',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
