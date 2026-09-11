import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        //port: '',
        pathname: '/**',
      },
    ],
  },
  
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete 
    // even if your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'auraworks.co.za' }],
        destination: 'https://www.auraworks.co.za/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
