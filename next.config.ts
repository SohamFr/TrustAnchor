import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unpkg.com', // For Globe textures
      },
    ],
  },

  // Performance & Security
  reactStrictMode: true,
  poweredByHeader: false,

  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Empty config to acknowledge Turbopack usage
    // This works fine with our webpack config for production builds
  },

  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only modules from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      });
    }
    return config;
  },
};

export default nextConfig;
