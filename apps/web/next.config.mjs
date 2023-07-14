/**
 * @type {import('next').NextConfig}
 */
const baseConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@lab/ui",
    "@lab/theme",
    "@plasmo/utils",
    "@plasmo/constants",
    "@local.ai/sdk"
  ],
  compiler: {
    emotion: true
  }
}

export default baseConfig
