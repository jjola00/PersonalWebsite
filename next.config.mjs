/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable ESLint during builds to prevent build failures from linting errors
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'github-readme-stats.vercel.app'
            },
            {
                protocol: 'https',
                hostname: 'skillicons.dev'
            },
            {
                protocol: 'https',
                hostname: 'github-readme-streak-stats.herokuapp.com'
            },
            {
                protocol: 'https',
                hostname: 'github-readme-activity-graph.vercel.app'
            },
            {
                protocol: 'https',
                hostname: 'image.tmdb.org'
            },
            {
                protocol: 'https',
                hostname: 'a.ltrbxd.com'
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co'
            },
            {
                protocol: 'https',
                hostname: 'lastfm.freetls.fastly.net'
            }
        ],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
    },
    output: 'standalone',
    async headers() {
        return [
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
    // Compiler optimizations for security and performance
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
        reactRemoveProperties: process.env.NODE_ENV === 'production' ? { properties: ['^data-testid'] } : false,
        styledComponents: true,
    },
    // Enable experimental features for better performance
    experimental: {
        serverComponentsExternalPackages: [],
        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            'clsx'
        ],
        // Enable build caching for faster builds
        turbotrace: {
            logLevel: 'error'
        },
        // Optimize CSS loading - disabled due to build issues
        // optimizeCss: true,
        // Server Actions are enabled by default in Next.js 14+
    },
    // Webpack optimizations
    webpack: (config, { dev, isServer }) => {
        // Production optimizations
        if (!dev) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                            priority: 10,
                        },
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            priority: 5,
                            reuseExistingChunk: true,
                        },
                        background: {
                            test: /[\\/](AmbientBackground|BackgroundVideo|FireFliesBackground)[\\/]/,
                            name: 'background',
                            chunks: 'all',
                            priority: 15,
                        },
                    },
                },
            };
        }

        // Tree shaking is handled by Next.js automatically

        return config;
    },
    // Performance optimizations
    poweredByHeader: false,
    compress: true,
    generateEtags: true,
    // Static optimization
    trailingSlash: false,
    // Build optimizations
    swcMinify: true,
    
    // Production build optimizations
    productionBrowserSourceMaps: false,
    
    // Optimize fonts
    optimizeFonts: true,
    
    // Enable build-time optimizations
    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{member}}',
            skipDefaultConversion: true
        }
    },
    
    // Build performance
    onDemandEntries: {
        maxInactiveAge: 25 * 1000,
        pagesBufferLength: 2,
    }
}

export default nextConfig;