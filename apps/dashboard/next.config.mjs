/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/relv",
  transpilePackages: ["@kors-relv/database", "@kors-relv/collect"],
  allowedDevOrigins: ['home.cla6sha.de']
};

export default nextConfig;
