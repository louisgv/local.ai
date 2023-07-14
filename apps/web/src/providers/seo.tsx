import Head from "next/head"

export const DynamicFavIcon = () => {
  return (
    <Head>
      <link
        key="favicon"
        rel="icon"
        type="image/svg+xml"
        href={`/favicon.png`}
        sizes="any"
      />
    </Head>
  )
}
