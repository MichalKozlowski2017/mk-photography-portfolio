import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/uploads/**",
        search: "",
      },
    ],
  },
  serverExternalPackages: ["sharp", "exifr", "better-sqlite3"],
};

export default nextConfig;
