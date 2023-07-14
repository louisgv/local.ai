import { GlobalStyle } from "@lab/theme/global-style"
import { UIProvider } from "@lab/ui/provider"
import type { AppProps } from "next/app"

import "@lab/theme/fonts.css"
import "@lab/theme/tailwind.css"

import { Layout } from "~features/layout"
import { GlobalProvider } from "~providers/global"

// App directory wasm bundle does not work on MacOSX yet...
const LocalAIDesktopApp = ({ Component, pageProps }: AppProps) => (
  <UIProvider>
    <GlobalProvider>
      <GlobalStyle />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GlobalProvider>
  </UIProvider>
)

export default LocalAIDesktopApp
