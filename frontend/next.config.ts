import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,      // เช็คการเปลี่ยนแปลงทุกๆ 1 วินาที
        aggregateTimeout: 300, // ดีเลย์ก่อนรีโหลดหลังบันทึกไฟล์
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost/api/:path*',
      },
      {
        source: '/badminton/:path*',
        destination: 'http://localhost/badminton/:path*',
      },
    ];
  },

};



export default nextConfig;
