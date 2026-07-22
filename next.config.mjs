/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build sırasında ESLint ve TypeScript kilitlenmelerini engeller
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-ee9c36333afb4a8abe1e26dcc310f8ec.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
        pathname: "/**",
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

// setupDevPlatform sadece yerel geliştirme (local dev) için geçerlidir.
// Cloudflare build/production aşamasında çalışmasını engellemek için async IIFE içine alıyoruz:
if (process.env.NODE_ENV === 'development') {
  (async () => {
    const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
    await setupDevPlatform();
  })();
}

export default nextConfig;
