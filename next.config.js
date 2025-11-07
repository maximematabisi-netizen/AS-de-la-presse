/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Use remotePatterns instead of the deprecated `domains` option
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      // Allow Vercel Blob public storage hostnames (used by /api/upload)
      {
        protocol: 'https',
        hostname: 'ch1bayg2jrjhz8wb.public.blob.vercel-storage.com',
      },
    ],
  },
  // Disable ESLint checks during the build on CI/production to avoid failing builds
  // due to stylistic rules. Local dev still runs linting.
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig