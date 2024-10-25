/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xjzjmufcwryxhopgcvhz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    appDir: true,
  },
  // Add these settings
  typescript: {
    // During development you can disable this
    ignoreBuildErrors: false,
  },
  eslint: {
    // During development you can disable this
    ignoreDuringBuilds: false,
  },
  // This helps with some client/server component issues
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};
  
export default nextConfig;