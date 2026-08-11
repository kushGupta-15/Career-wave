/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'uploadthing.com', 'utfs.io'], // Added 'utfs.io'
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
