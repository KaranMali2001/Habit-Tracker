import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 🆕 Webpack configuration for New Relic
  webpack: (config, { isServer }) => {
    // Only for server-side builds (API routes)
    if (isServer) {
      // Ensure New Relic is loaded first for serverless functions
      config.resolve.alias = {
        ...config.resolve.alias,
        newrelic: require.resolve("newrelic"),
      };
    }

    return config;
  },

  // 🆕 Environment variables (for runtime access)
  env: {
    NEW_RELIC_APP_NAME: process.env.NEW_RELIC_APP_NAME,
    NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
  },
};

export default nextConfig;