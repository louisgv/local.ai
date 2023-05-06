declare namespace NodeJS {
  interface ProcessEnv {
    PUBLIC_URL: string
    VERCEL_ENV: "production" | "preview" | "development"
  }
}

interface Window {}
