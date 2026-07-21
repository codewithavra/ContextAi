const requiredEnv = (name: string): string => {
  const value = import.meta.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  SERVER_URL: requiredEnv("VITE_SERVER_URL"),
}
