/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xjzjmufcwryxhopgcvhz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'qrcgcustomers.s3-eu-west-1.amazonaws.com',
        port: '',
        pathname: '/account13454916/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};
  
export default nextConfig;
