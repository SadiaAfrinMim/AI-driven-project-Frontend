/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disabled — reactCompiler + Turbopack is unstable and causes panics
  // reactCompiler: true,

  distDir: process.env.NEXT_DIST_DIR || '.next',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Matches any domain name (e.g., images.unsplash.com, res.cloudinary.com)
      },
      {
        protocol: 'http',
        hostname: '**', // Matches any non-secure domain name if needed
      },
    ],
  },
};

module.exports = nextConfig;