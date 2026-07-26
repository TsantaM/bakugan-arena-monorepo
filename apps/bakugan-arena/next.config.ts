import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, '../..');

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: "50mb"
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@bakugan-arena/i18n'],
  // Monorepo: trace files from repo root so workspace packages are included
  outputFileTracingRoot: monorepoRoot,
  // Runtime require() of locale JSON is dynamic — force-include catalogs in the serverless bundle
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/@bakugan-arena/i18n/locales/**/*',
      '../../libs/i18n/locales/**/*',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      // Fallback for user-uploaded / third-party avatar hosts
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
