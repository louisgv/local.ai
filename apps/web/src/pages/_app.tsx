import { GlobalStyle } from "@localai/theme/global-style"
import type { AppProps } from "next/app"

import { GlobalProvider } from "~providers/global"
import { DynamicFavIcon } from "~providers/seo"

import "@localai/theme/fonts.css"
import "@localai/theme/tailwind.css"
import "@localai/theme/scrollbar.css"

import Head from "next/head"

const LocalAIWebApp = ({ Component, pageProps }: AppProps) => (
  <GlobalProvider>
    <Head>
      {/* discord large image embed */}
      <meta name="theme-color" content={"red"} key="theme-color" />
      <link type="application/json+oembed" href="/oEmbed.json" />
    </Head>
    <GlobalStyle />
    <DynamicFavIcon />
    <Component {...pageProps} />
  </GlobalProvider>
)

export default LocalAIWebApp
