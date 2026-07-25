import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, '../..');

const nextConfig: NextConfig = {
  /* config options here */
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',   // Autorise tous les domaines HTTPS
        pathname: '/**',  // (optionnel) autorisation pour tous les chemins
      },
    ],
  },
};

export default withNextIntl(nextConfig);
