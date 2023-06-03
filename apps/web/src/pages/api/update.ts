export const config = {
  runtime: "edge"
}

const releaseJsonUrl =
  "https://github.com/louisgv/local.ai/releases/latest/download/latest.json"

export default async function handler() {
  const releaseJson = await fetch(releaseJsonUrl).then((res) => res.text())

  return new Response(releaseJson, {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control":
        "public, s-maxage=2592000, max-age=0, stale-while-revalidate=600"
    }
  })
}
