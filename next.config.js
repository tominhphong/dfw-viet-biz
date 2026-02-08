/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // DANGER: This allows production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'gpbizxheydgpmowzdwnr.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
}

module.exports = nextConfig

