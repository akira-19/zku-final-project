/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.experiments = config.experiments || {};
    config.experiments.topLevelAwait = true;
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback.fs = false;
    config.experiments = {
      asyncWebAssembly: true,
    };
    config.output.webassemblyModuleFilename = 'public/Ghosts.wasm';

    return config;
  },
};
