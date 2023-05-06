import type { DefaultSeoProps } from "next-seo"
import Head from "next/head"
import { useEffect, useState } from "react"

export const PRODUCT_NAME = "LocalAI"

export const SEO: DefaultSeoProps = {
  titleTemplate: `%s – ${PRODUCT_NAME}`
}

export const DynamicFavIcon = () => {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    setIsDark(window?.matchMedia("(prefers-color-scheme: dark)").matches)
  }, [])

  return (
    <Head>
      <link
        key="favicon"
        rel="icon"
        type="image/svg+xml"
        href={`/favicon-${isDark ? "dark" : "light"}.svg`}
        sizes="any"
      />
    </Head>
  )
}
