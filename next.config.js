const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@clerk/nextjs'] = path.resolve(__dirname, 'mocks/clerk-nextjs-mock.tsx');
    return config;
  }
}

module.exports = nextConfig
