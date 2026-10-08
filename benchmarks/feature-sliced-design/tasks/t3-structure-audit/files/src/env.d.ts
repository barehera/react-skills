interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ANALYTICS_WRITE_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_SECRET_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
