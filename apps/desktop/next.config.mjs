/**
 * @type {import('next').NextConfig}
 */
const baseConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@localai/ui",
    "@localai/theme",
    "@plasmo/utils",
    "@plasmo/constants"
  ],
  output: "export",
  swcMinify: true,
  env: {
    NEXT_PUBLIC_LOCALAI_ORIGIN:
      process.env.NODE_ENV === "production"
        ? "https://localai.app"
        : "http://localhost:3047"
  }
}

export default baseConfig
