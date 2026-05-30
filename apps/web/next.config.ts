import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@demo/sdk"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coresg-normal.trae.ai",
        pathname: "/api/ide/v1/text_to_image",
      },
    ],
  },
};

export default nextConfig;
