import { GlobalStyle } from "@localai/theme/global-style"
import type { AppProps } from "next/app"

import "@localai/theme/fonts.css"
import "@localai/theme/scrollbar.css"
import "@localai/theme/tailwind.css"

import Head from "next/head"

// This default export is required in a new `pages/_app.js` file.
const LocalAIDesktopApp = ({ Component, pageProps }: AppProps) => (
  <div className="bg-gray-1 text-gray-11 w-screen h-screen">
    <GlobalStyle />
    <Component {...pageProps} />
  </div>
)

export default LocalAIDesktopApp
