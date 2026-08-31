/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  async headers() {
    return [
      {
        source: '/:all*(svg|png|jpg|jpeg|webp|avif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
