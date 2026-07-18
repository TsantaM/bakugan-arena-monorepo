import type { NextConfig } from "next";

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

export default nextConfig;
