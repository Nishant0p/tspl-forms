/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
      allowedOrigins: ['forms.tsplgroup.in', 'localhost:3000'],
    },
  },
};

module.exports = nextConfig


