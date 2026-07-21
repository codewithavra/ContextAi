import { env } from "@/config"
import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
  // This must point at the Express server where Better Auth is mounted.
  baseURL: env.SERVER_URL,
  // Mirrors the server username plugin so `signUp.email` accepts `username`.
  plugins: [usernameClient()],
})

// Export methods from the same configured client so requests carry the right base URL.
export const { signIn, signUp, signOut, useSession } = authClient
