/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPSYNC_GRAPHQL_ENDPOINT: string
  readonly VITE_APPSYNC_REGION: string
  readonly VITE_APPSYNC_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
