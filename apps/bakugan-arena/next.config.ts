import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
  // vaul utilise createContext au top-level : doit être correctement
  // traité comme module client (évite createContext is not a function sur Vercel)
  transpilePackages: ['@bakugan-arena/i18n', 'vaul'],
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
