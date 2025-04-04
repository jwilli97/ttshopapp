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
};
  
export default nextConfig;