/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co', // Or the specific ibb.co subdomain
        port: '', // Port is usually omitted for standard HTTPS (443)
      },
    ],
  },
};

export default nextConfig;
