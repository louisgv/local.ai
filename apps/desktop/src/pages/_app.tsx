import type { AppProps } from "next/app"

import "@localai/theme/fonts.css"
import "@localai/theme/scrollbar.css"
import "@localai/theme/tailwind.css"

import { GlobalStyle } from "@localai/theme/global-style"

// This default export is required in a new `pages/_app.js` file.
export default function InstallerApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-mauve-1 text-mauve-11 w-screen h-screen">
      <GlobalStyle />
      <Component {...pageProps} />
    </div>
  )
}
