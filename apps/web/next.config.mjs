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
  compiler: {
    emotion: true
  }
}

export default baseConfig
