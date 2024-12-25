/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/dashboard',
          permanent: true, // Set to true if the redirect is permanent (301), false if temporary (302)
        },
      ];
    },
  };
  
  export default nextConfig;
  