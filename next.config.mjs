/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the Next.js dev overlay button / build-activity badge in the corner
  // (dev-only UI; it never appears in production anyway).
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
