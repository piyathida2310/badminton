import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["localhost"], // ✅ อนุญาตโหลดรูปจาก backend localhost
  },
};

export default nextConfig;
