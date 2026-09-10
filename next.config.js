/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracing: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['forms.tsplgroup.in', '187.127.159.207', 'localhost:3000'],
    },
  },
}

module.exports = nextConfig


