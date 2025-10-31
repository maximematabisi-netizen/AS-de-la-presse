/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Use remotePatterns instead of the deprecated `domains` option
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

module.exports = nextConfig