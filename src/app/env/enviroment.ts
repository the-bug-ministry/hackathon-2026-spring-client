type AppEnvironment = "dev" | "prod"

const normalizeEnvValue = (raw?: string): AppEnvironment => {
  const value = raw?.trim().toLowerCase()
  if (value === "prod") return "prod"
  return "dev"
}

const FALLBACK_ENV: AppEnvironment =
  import.meta.env.MODE === "production" ? "prod" : "dev"

const resolvedEnvironment = (() => {
  const configured = normalizeEnvValue(import.meta.env.VITE_PUBLIC_ENV)
  return configured === "dev" || configured === "prod"
    ? configured
    : FALLBACK_ENV
})()

export const APP_ENVIRONMENT = resolvedEnvironment
export const IS_DEV_ENV = resolvedEnvironment === "dev"
export const IS_PROD_ENV = resolvedEnvironment === "prod"
