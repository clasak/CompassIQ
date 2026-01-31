/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper chunk generation in dev mode
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Ensure chunks are properly generated in dev mode
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      }
    }
    return config
  },
  // Prevent issues with chunk loading
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
