import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce smaller, self-contained build output to stabilize Azure SWA deploys
  output: "standalone",
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.shopmy.us',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
