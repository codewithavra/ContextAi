import { AuthScreen } from "@/components/auth-screen"
import { ChatWorkspace } from "@/components/chat-workspace"
import { useSession } from "@/lib/auth-client"

export function App() {
  // `useSession` keeps this screen in sync after sign-in, sign-out, or GitHub redirect.
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <main className="grid min-h-svh place-items-center bg-zinc-100 text-sm text-zinc-500">Loading your workspace…</main>
  }

  if (!session?.user) return <AuthScreen />

  return (
    <ChatWorkspace userName={session.user.name || session.user.email} />
  )
}

export default App
