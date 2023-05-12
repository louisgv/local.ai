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
  compiler: {
    emotion: true
  }
}

export default baseConfig
