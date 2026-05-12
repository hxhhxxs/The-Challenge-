/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/instant',
        permanent: false,
      },
      {
        source: '/start',
        destination: '/instant',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
