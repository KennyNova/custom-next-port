/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_CALCOM_BASE_URL: process.env.CALCOM_BASE_URL,
  },
}

module.exports = nextConfig