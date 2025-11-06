import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 이미지 도메인
      { hostname: "www.visitkorea.or.kr" },
      { hostname: "api.visitkorea.or.kr" },
      { hostname: "tong.visitkorea.or.kr" },
      { hostname: "api.cdn.visitkorea.or.kr" },
    ],
  },
};

export default nextConfig;
