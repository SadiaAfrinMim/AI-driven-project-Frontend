/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disabled — reactCompiler + Turbopack is unstable and causes panics
  // reactCompiler: true,

  distDir: process.env.NEXT_DIST_DIR || '.next',
};

module.exports = nextConfig;
