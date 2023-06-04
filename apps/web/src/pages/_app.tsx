import { GlobalStyle } from "@localai/theme/global-style"
import type { AppProps } from "next/app"

import { GlobalProvider } from "~providers/global"
import { DynamicFavIcon } from "~providers/seo"

import "@localai/theme/fonts.css"
import "@localai/theme/tailwind.css"

const LocalAIWebApp = ({ Component, pageProps }: AppProps) => (
  <GlobalProvider>
    <GlobalStyle />
    <DynamicFavIcon />
    <Component {...pageProps} />
  </GlobalProvider>
)

export default LocalAIWebApp
