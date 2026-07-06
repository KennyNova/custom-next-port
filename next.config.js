/** @type {import('next').NextConfig} */
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
const posthogAssetsHost = posthogHost.replace('.i.posthog.com', '-assets.i.posthog.com')

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      {
        source: '/ingest/array/:path*',
        destination: `${posthogAssetsHost}/array/:path*`,
      },
      {
        source: '/ingest/:path*',
        destination: `${posthogHost}/:path*`,
      },
    ]
  },
  skipTrailingSlashRedirect: true,
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com', 'image.mux.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_CALCOM_BASE_URL: process.env.CALCOM_BASE_URL,
  },
}

module.exports = nextConfig