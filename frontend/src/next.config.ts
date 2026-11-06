import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    agentUpgrade: "security",
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'auraworks.co.za' }],
        destination: 'https://www.auraworks.co.za/:path*',
        permanent: true,
      },
      {
        source: '/aurahq/:path*',
        destination: 'https://dash.auraworks.co.za/aurahq/:path*',
        permanent: false,
      },
      {
        source: '/aurahq',
        destination: 'https://dash.auraworks.co.za/aurahq',
        permanent: false,
      },
      {
        source: '/login',
        destination: 'https://dash.auraworks.co.za/login',
        permanent: false,
      },
      {
        source: '/signup',
        destination: 'https://dash.auraworks.co.za/signup',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
