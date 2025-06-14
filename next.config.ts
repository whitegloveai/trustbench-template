import { NextConfig } from "next"

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "arbeita.s3.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "arbeita.s3.eu-north-1.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "tsker.s3.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
    ],
  },
}

export default nextConfig
