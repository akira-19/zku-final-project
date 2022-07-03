/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.experiments = config.experiments || {};
    config.experiments.topLevelAwait = true;
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    return config;
  },
};
