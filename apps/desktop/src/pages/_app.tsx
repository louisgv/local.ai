import { GlobalStyle } from "@lab/theme/global-style"
import type { AppProps } from "next/app"

import "@lab/theme/fonts.css"
import "@lab/theme/scrollbar.css"
import "@lab/theme/tailwind.css"

import { Layout } from "~features/layout"
import { GlobalProvider } from "~providers/global"

// App directory wasm bundle does not work on MacOSX yet...
const LocalAIDesktopApp = ({ Component, pageProps }: AppProps) => (
  <GlobalProvider>
    <GlobalStyle />
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </GlobalProvider>
)

export default LocalAIDesktopApp
