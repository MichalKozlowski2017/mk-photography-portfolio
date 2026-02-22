import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local uploads (dev only)
    localPatterns: [
      {
        pathname: "/uploads/**",
        search: "",
      },
    ],
    // Cloudinary (production)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: ["sharp", "exifr", "better-sqlite3"],
};

export default nextConfig;
