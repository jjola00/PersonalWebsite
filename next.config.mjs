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
  }
  
export default nextConfig