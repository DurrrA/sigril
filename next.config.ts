import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/login', // Expose /login
        destination: '/auth/login', // Internally map to /auth/login
      },
      {
        source: '/register', // Expose /register
        destination: '/auth/register', // Internally map to /auth/register
      },
    ];
  },
};

export default nextConfig;
