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
  env: {
    // Replicate API configuration
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    // Rate limiting configuration
    MAX_REQUESTS_PER_MINUTE: process.env.MAX_REQUESTS_PER_MINUTE || '2',
    REQUEST_WINDOW_SIZE_MS: process.env.REQUEST_WINDOW_SIZE_MS || '60000',
    // Retry mechanism configuration
    MAX_RETRIES: process.env.MAX_RETRIES || '2',
    INITIAL_RETRY_DELAY_MS: process.env.INITIAL_RETRY_DELAY_MS || '1000',
    BACKOFF_FACTOR: process.env.BACKOFF_FACTOR || '2',
    // ImageKit transformations
    NEXT_PUBLIC_IMAGEKIT_TRANSFORMATIONS: process.env.NEXT_PUBLIC_IMAGEKIT_TRANSFORMATIONS || '/tr:w-600,h-800,e-contrast,e-sharpen,c-at_max:b-20_FFFFFF:b-2_000000:l-text,i-CHICBYSALLY,ff-Audiowide,fs-18,co-FFFFFF,lx-bh_mul_0.65,ly-bh_mul_0.9,l-end:l-text,i-stylecard%20by,ff-Audiowide,fs-12,co-FFFFFF,lx-bh_mul_0.7,ly-bh_mul_0.87,l-end',
  },
};

export default nextConfig;
