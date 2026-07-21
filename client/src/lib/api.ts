import { env } from "@/config"

export interface Chat {
  _id: string
  title: string
  persona: string
  createdAt: string
  updatedAt: string
}

export interface Source {
  filename?: string
  text: string
  score?: number
}

export interface ChatMessage {
  _id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  createdAt: string
}

export interface DocumentItem {
  _id: string
  originalName: string
  size: number
  status: "queued" | "processing" | "ready" | "failed"
  createdAt: string
}

export interface Persona {
  key: string
  label: string
  description: string
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

// All pipeline calls include cookies because Better Auth uses the server session.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.SERVER_URL}${path}`, {
    credentials: "include",
    ...init,
  })
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || !body?.success) {
    throw new Error(body?.message ?? "Something went wrong. Please try again.")
  }

  return body.data
}

export const api = {
  listChats: () => request<Chat[]>("/api/v1/chats"),
  listPersonas: () => request<Persona[]>("/api/v1/chats/personas"),
  createChat: (title: string, persona = "default") =>
    request<Chat>("/api/v1/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, persona }),
    }),
  deleteChat: (chatId: string) => request<void>(`/api/v1/chats/${chatId}`, { method: "DELETE" }),
  updatePersona: (chatId: string, persona: string) =>
    request<Chat>(`/api/v1/chats/${chatId}/persona`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona }),
    }),
  listMessages: (chatId: string) => request<ChatMessage[]>(`/api/v1/chats/${chatId}/messages`),
  ask: (chatId: string, question: string) =>
    request<ChatMessage>(`/api/v1/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    }),
  listDocuments: () => request<DocumentItem[]>("/api/v1/documents"),
  uploadDocument: (file: File) => {
    const form = new FormData()
    form.append("file", file)
    return request<DocumentItem>("/api/v1/documents", { method: "POST", body: form })
  },
}
