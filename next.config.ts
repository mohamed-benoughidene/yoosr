import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */

  turbopack: {
    root: __dirname,
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
  
  async redirects() {
    return [
      {
        source: '/:locale/doc',
        destination: '/:locale/docs',
        permanent: true,
      },
      {
        source: '/:locale/doc/:slug*',
        destination: '/:locale/docs/:slug*',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
