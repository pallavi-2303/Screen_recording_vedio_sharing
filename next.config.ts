import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint:{
ignoreDuringBuilds:true,
  },
  typescript:{
ignoreBuildErrors:true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "jsm-snap.b-cdn.net",
        protocol: "https",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
