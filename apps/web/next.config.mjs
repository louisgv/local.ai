/**
 * @type {import('next').NextConfig}
 */
const baseConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@lab/ui",
    "@lab/theme",
    "@plasmo/utils",
    "@plasmo/constants"
  ],
  compiler: {
    emotion: true
  }
}

export default baseConfig
