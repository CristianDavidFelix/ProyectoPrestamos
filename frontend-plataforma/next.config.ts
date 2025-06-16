import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.modules.push(__dirname + '/src'); // Esto permite a Next.js buscar dentro de 'src' también
    return config;
  },
};

export default nextConfig;
