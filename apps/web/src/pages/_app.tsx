import { GlobalStyle } from "@localai/theme/global-style"
import type { AppProps } from "next/app"

import { CoreProvider } from "~providers/core"
import { DynamicFavIcon } from "~providers/seo"

import "@localai/theme/fonts.css"
import "@localai/theme/tailwind.css"

const LocalAIWebApp = ({ Component, pageProps }: AppProps) => (
  <CoreProvider>
    <GlobalStyle />
    <DynamicFavIcon />
    <Component {...pageProps} />
  </CoreProvider>
)

export default LocalAIWebApp
