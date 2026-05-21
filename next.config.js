/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // Disable Turbopack (unstable and causing panics after dashboard restructure)
  experimental: {
    turbopack: false,
  },
};

module.exports = nextConfig;
