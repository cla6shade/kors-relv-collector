/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/relv",
  transpilePackages: ["@kors-relv/database", "@kors-relv/collect"],
};

export default nextConfig;
