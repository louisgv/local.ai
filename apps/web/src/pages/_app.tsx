import { GlobalStyle } from "@lab/theme/global-style"
import type { AppProps } from "next/app"

import { GlobalProvider } from "~providers/global"
import { DynamicFavIcon } from "~providers/seo"

import "@lab/theme/fonts.css"
import "@lab/theme/tailwind.css"
import "@lab/theme/scrollbar.css"

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
