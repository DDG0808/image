/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_ANALYTICS_DEV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
