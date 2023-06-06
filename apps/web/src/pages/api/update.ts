import { baseUrl } from "~pages/api/_constants"

export const config = {
  runtime: "edge"
}

const releaseJsonUrl = `${baseUrl}/latest.json`

export default async function handler() {
  return fetch(releaseJsonUrl)
  // const releaseJson = await fetch(releaseJsonUrl).then((res) => res.text())

  // return new Response(releaseJson, {
  //   status: 200,
  //   headers: {
  //     "content-type": "application/json",
  //     "cache-control":
  //       "public, s-maxage=2592000, max-age=0, stale-while-revalidate=600"
  //   }
  // })
}
