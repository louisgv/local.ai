export const config = {
  runtime: "edge"
}

const version = "v0.0.1"
const githubRepo = "louisgv/local.ai"

const updateJson = {
  version,
  platforms: {
    "darwin-x86_64": {
      signature: "Content of app.tar.gz.sig",
      url: `https://github.com/${githubRepo}/releases/download/${version}/app-x86_64.app.tar.gz`
    },
    "darwin-aarch64": {
      signature: "Content of app.tar.gz.sig",
      url: `https://github.com/${githubRepo}/releases/download/${version}/Local.AI_x64.app.tar.gz`
    },
    "linux-x86_64": {
      signature: "Content of app.AppImage.tar.gz.sig",
      url: `https://github.com/${githubRepo}/releases/download/${version}/app-amd64.AppImage.tar.gz`
    },
    "windows-x86_64": {
      signature: "Content of app.msi.sig",
      url: `https://github.com/${githubRepo}/releases/download/${version}/app-x64.msi.zip`
    }
  }
}

export default async function handler() {
  return new Response(JSON.stringify(updateJson), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control":
        "public, s-maxage=2592000, max-age=0, stale-while-revalidate=600"
    }
  })
}
