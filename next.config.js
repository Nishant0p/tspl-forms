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
      allowedOrigins: ['forms.tsplgroup.in', 'localhost:3000'],
    },
  },
}

module.exports = nextConfig


