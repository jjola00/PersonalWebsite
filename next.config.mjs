import bundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Hosts that next/image optimizes. GitHub stats and Spotify/Last.fm art
        // render with `unoptimized`, so they don't need entries here.
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org'
            },
            {
                protocol: 'https',
                hostname: 'a.ltrbxd.com'
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
    },
    async headers() {
        return [
            {
                // Cache wallpaper videos for 30 days
                source: '/wallpapers/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=2592000, immutable'
                    }
                ]
            },
            {
                // Ambient effect scripts load inside the background iframe on every
                // visit. Not content-hashed, so keep the cache short-ish.
                source: '/js/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800'
                    }
                ]
            },
            {
                // Apply security headers to all routes
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for React and animations
                            "style-src 'self' 'unsafe-inline'", // Allow inline styles for Tailwind and components
                            "img-src 'self' data: https:", // Allow images from self, data URLs, and HTTPS
                            "font-src 'self' data:",
                            "connect-src 'self' https:", // Allow API calls to HTTPS endpoints
                            "media-src 'self' data:",
                            "object-src 'none'", // Prevent object/embed/applet
                            "base-uri 'self'",
                            "form-action 'self'",
                            "frame-src 'self'", // Allow same-origin iframes for effects
                            "frame-ancestors 'self'", // Allow self-framing for effects
                            "upgrade-insecure-requests"
                        ].join('; ')
                    },

                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff' // Prevent MIME type sniffing
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block' // Enable XSS protection
                    },
                    {
                        key: 'Permissions-Policy',
                        value: [
                            'camera=()',
                            'microphone=()',
                            'geolocation=()',
                            'interest-cohort=()'
                        ].join(', ')
                    }
                ]
            }
        ];
    },
    compiler: {
        // Keep warnings and errors in production so failures (e.g. a broken
        // wallpaper) still show up in the browser console.
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },
    experimental: {
        // Rewrites barrel imports (e.g. `import { Home } from 'lucide-react'`) to
        // per-module imports so only the icons and motion pieces in use ship.
        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
        ],
    },
    // The Letterboxd API routes read these with fs at runtime; make sure they
    // are bundled into those functions on Vercel.
    outputFileTracingIncludes: {
        '/api/letterboxd/*': ['./src/data/letterboxd/**/*'],
    },
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
}

// `npm run analyze` sets ANALYZE=true to open the bundle treemaps after building
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

export default withBundleAnalyzer(nextConfig);
