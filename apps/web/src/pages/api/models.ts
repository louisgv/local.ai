import { modelList } from "@models/index"

export const config = {
  runtime: "edge"
}

export default async function handler() {
  return new Response(JSON.stringify(modelList), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control":
        "public, s-maxage=2592000, max-age=0, stale-while-revalidate=600"
    }
  })
}
