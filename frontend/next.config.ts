import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: true, // ลบ console.log ใน production
  },
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
      // เพิ่มส่วนนี้เพื่อให้ Next.js ยอมโหลดรูปจาก Domain ของคุณ
      {
        protocol: 'https',
        hostname: 'judjang.online', 
      },
    ],
  },
  async rewrites() {
    // ใน Production แนะนำให้จัดการผ่าน Nginx โดยตรง 
    // แต่ถ้าจำเป็นต้องใช้ ให้เช็คว่าเรียกผ่าน URL ที่ถูกต้อง
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost/api/:path*' // dev
          : 'https://judjang.online/api/:path*', // prod
      },
      // ลบ /badminton/ ออกจาก rewrites เพื่อให้ Browser วิ่งไปหา Nginx โดยตรง
    ];
  },

};



export default nextConfig;
