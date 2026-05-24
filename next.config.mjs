/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma and bcryptjs must NOT be bundled by webpack —
  // they rely on native binaries resolved at runtime.
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
