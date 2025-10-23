/** @type {import('next').NextConfig} */
const nextConfig = {
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
            }
        ]
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
    },
    // Enable experimental features for better security
    experimental: {
        serverComponentsExternalPackages: [],
    }
}
  
export default nextConfig