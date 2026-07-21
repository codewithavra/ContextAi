import { useEffect, useRef, useState } from "react"
import { FileText, LoaderCircle, LogOut, MessageSquarePlus, Paperclip, SendHorizontal, Sparkles, Trash2, Upload, X } from "lucide-react"

import { api, type Chat, type ChatMessage, type DocumentItem, type Persona } from "@/lib/api"
import { signOut } from "@/lib/auth-client"

interface ChatWorkspaceProps {
  userName: string
}

export function ChatWorkspace({ userName }: ChatWorkspaceProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedPersona, setSelectedPersona] = useState("default")
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingFileName, setUploadingFileName] = useState("")
  const [error, setError] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const messagesEnd = useRef<HTMLDivElement>(null)
  const isParsing = documents.some((document) => document.status === "queued" || document.status === "processing")
  const processingCount = documents.filter((document) => document.status === "queued" || document.status === "processing").length
  const isDocumentBusy = isUploading || isParsing

  // Initial dashboard data is loaded only after Better Auth confirms a session.
  useEffect(() => {
    void Promise.all([api.listChats(), api.listDocuments(), api.listPersonas()])
      .then(([savedChats, savedDocuments, availablePersonas]) => {
        setChats(savedChats)
        setDocuments(savedDocuments)
        setPersonas(availablePersonas)
      })
      .catch((reason: Error) => setError(reason.message))
  }, [])

  // Keep checking while the ingestion worker parses and embeds an uploaded file.
  useEffect(() => {
    if (!isParsing) return

    const pollDocuments = () => {
      void api.listDocuments().then(setDocuments).catch(() => undefined)
    }
    const interval = window.setInterval(pollDocuments, 3000)
    return () => window.clearInterval(interval)
  }, [isParsing])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isSending])

  async function selectChat(chat: Chat) {
    setActiveChat(chat)
    setSelectedPersona(chat.persona)
    setError("")
    try {
      setMessages(await api.listMessages(chat._id))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load this conversation.")
    }
  }

  async function startChat() {
    setError("")
    try {
      const chat = await api.createChat("New conversation", selectedPersona)
      setChats((current) => [chat, ...current])
      setActiveChat(chat)
      setMessages([])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start a conversation.")
    }
  }

  async function changePersona(persona: string) {
    setSelectedPersona(persona)
    if (!activeChat) return

    try {
      const updatedChat = await api.updatePersona(activeChat._id, persona)
      setActiveChat(updatedChat)
      setChats((current) => current.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat)))
    } catch (reason) {
      setSelectedPersona(activeChat.persona)
      setError(reason instanceof Error ? reason.message : "Could not update the response style.")
    }
  }

  async function removeChat(chat: Chat) {
    setError("")
    try {
      await api.deleteChat(chat._id)
      setChats((current) => current.filter((item) => item._id !== chat._id))
      if (activeChat?._id === chat._id) {
        setActiveChat(null)
        setMessages([])
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete this conversation.")
    }
  }

  async function sendQuestion() {
    const text = question.trim()
    // A query would be incomplete while the worker is still creating embeddings.
    if (!text || isSending || isDocumentBusy) return

    let chat = activeChat
    if (!chat) {
      try {
        chat = await api.createChat(text.slice(0, 48), selectedPersona)
        setChats((current) => [chat!, ...current])
        setActiveChat(chat)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not start a conversation.")
        return
      }
    }

    const optimistic: ChatMessage = { _id: `pending-${Date.now()}`, role: "user", content: text, createdAt: new Date().toISOString() }
    setMessages((current) => [...current, optimistic])
    setQuestion("")
    setIsSending(true)
    setError("")
    try {
      const answer = await api.ask(chat._id, text)
      setMessages((current) => [...current, answer])
    } catch (reason) {
      setMessages((current) => current.filter((message) => message._id !== optimistic._id))
      setError(reason instanceof Error ? reason.message : "The assistant could not answer right now.")
    } finally {
      setIsSending(false)
    }
  }

  async function uploadFile(file: File) {
    setIsUploading(true)
    setUploadingFileName(file.name)
    setError("")
    try {
      const document = await api.uploadDocument(file)
      setDocuments((current) => [document, ...current])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed.")
    } finally {
      setIsUploading(false)
      setUploadingFileName("")
    }
  }

  return (
    <main className="min-h-svh bg-zinc-100 p-3 text-zinc-950 sm:p-5 md:h-svh md:overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-7xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm md:h-[calc(100svh-2.5rem)] md:min-h-0 md:grid-cols-[260px_minmax(0,1fr)_250px] sm:min-h-[calc(100svh-2.5rem)]">
        <aside className="flex border-b border-zinc-200 p-4 md:flex-col md:border-r md:border-b-0">
          <div className="hidden items-center gap-2 md:flex"><div className="grid size-8 place-items-center rounded-lg bg-zinc-950 text-white"><Sparkles className="size-4" /></div><span className="font-semibold">ContextAI</span></div>
          <button className="ml-auto flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-3 text-sm font-medium text-white md:mt-8 md:ml-0" onClick={() => void startChat()}><MessageSquarePlus className="size-4" /> New chat</button>
          <div className="hidden min-h-0 flex-1 overflow-y-auto pt-5 md:block">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-zinc-400">History</p>
            <div className="space-y-1">
              {chats.map((chat) => <div className={`group flex items-center rounded-lg ${activeChat?._id === chat._id ? "bg-zinc-100" : "hover:bg-zinc-50"}`} key={chat._id}><button className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm ${activeChat?._id === chat._id ? "font-medium" : "text-zinc-600"}`} onClick={() => void selectChat(chat)}>{chat.title}</button><button className="mr-1 grid size-7 place-items-center rounded-md text-zinc-400 opacity-0 hover:bg-zinc-200 hover:text-zinc-800 group-hover:opacity-100 focus:opacity-100" onClick={() => void removeChat(chat)} aria-label={`Delete ${chat.title}`}><Trash2 className="size-3.5" /></button></div>)}
              {!chats.length && <p className="px-3 text-sm text-zinc-400">No conversations yet.</p>}
            </div>
          </div>
          <div className="ml-auto hidden border-t border-zinc-200 pt-4 md:block"><p className="mb-2 truncate px-2 text-sm text-zinc-500">{userName}</p><button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-600 hover:bg-zinc-100" onClick={() => void signOut()}><LogOut className="size-4" /> Sign out</button></div>
        </aside>

        <section className="flex min-h-[65svh] flex-col md:min-h-0">
          <header className="flex h-16 items-center justify-between gap-3 border-b border-zinc-200 px-5"><div className="min-w-0"><p className="truncate text-sm font-semibold">{activeChat?.title ?? "New conversation"}</p><p className="text-xs text-zinc-400">Answers use your uploaded documents</p></div><div className="flex items-center gap-2"><select className="h-8 max-w-28 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 outline-none focus:border-zinc-950 sm:max-w-none" aria-label="Response style" onChange={(event) => void changePersona(event.target.value)} title={personas.find((persona) => persona.key === selectedPersona)?.description} value={selectedPersona}>{personas.map((persona) => <option key={persona.key} value={persona.key}>{persona.label}</option>)}</select><button className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 md:hidden" onClick={() => void signOut()} aria-label="Sign out"><LogOut className="size-4" /></button></div></header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8">
            {!messages.length && <EmptyState />}
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message) => <MessageBubble key={message._id} message={message} />)}
              {isSending && <div className="flex items-center gap-2 text-sm text-zinc-500"><LoaderCircle className="size-4 animate-spin" /> Looking through your documents…</div>}
              <div ref={messagesEnd} />
            </div>
          </div>
          <div className="border-t border-zinc-200 bg-white p-4 sm:p-5">
            {error && <div className="mx-auto mb-3 flex max-w-3xl items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600">{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X className="size-4" /></button></div>}
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-zinc-300 p-2 focus-within:border-zinc-950"><button className="grid size-9 shrink-0 place-items-center rounded-xl text-zinc-500 hover:bg-zinc-100" onClick={() => fileInput.current?.click()} aria-label="Upload a document"><Paperclip className="size-4" /></button><input className="hidden" ref={fileInput} type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); event.currentTarget.value = "" }} /><textarea className="max-h-32 min-h-9 flex-1 resize-none py-2 text-sm outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed" disabled={isDocumentBusy} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendQuestion() } }} placeholder={isUploading ? "Uploading your document…" : isParsing ? "Preparing your documents…" : "Ask anything about your documents…"} rows={1} value={question} /><button className="grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white disabled:opacity-40" disabled={!question.trim() || isSending || isDocumentBusy} onClick={() => void sendQuestion()} aria-label="Send message"><SendHorizontal className="size-4" /></button></div>
            <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-zinc-400">{isUploading ? `Uploading ${uploadingFileName}…` : isParsing ? `${processingCount} document${processingCount === 1 ? " is" : "s are"} being processed. Chat will unlock automatically.` : "Enter to send · Shift + Enter for a new line"}</p>
          </div>
        </section>

        <aside className="border-t border-zinc-200 p-5 md:border-t-0 md:border-l"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Documents</h2><button className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100" disabled={isUploading} onClick={() => fileInput.current?.click()} aria-label="Upload document">{isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}</button></div><p className="mt-1 text-xs text-zinc-400">{isUploading ? `Uploading ${uploadingFileName}…` : isParsing ? "Worker is parsing and indexing your document…" : "Files are ready to use in chat."}</p><div className="mt-4 space-y-2">{documents.map((document) => <div className="flex items-start gap-2 rounded-xl bg-zinc-50 p-3" key={document._id}><FileText className="mt-0.5 size-4 shrink-0 text-zinc-500" /><div className="min-w-0"><p className="truncate text-sm text-zinc-700">{document.originalName}</p><p className="mt-0.5 text-xs capitalize text-zinc-400">{document.status === "queued" ? "Waiting for worker" : document.status === "processing" ? "Parsing and indexing…" : document.status}</p></div></div>)}{!documents.length && <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-400">Upload a PDF or text file to begin.</p>}</div></aside>
      </div>
    </main>
  )
}

function EmptyState() { return <div className="mx-auto grid max-w-xl place-items-center py-16 text-center"><div className="grid size-12 place-items-center rounded-2xl bg-zinc-950 text-white"><Sparkles className="size-5" /></div><h1 className="mt-5 text-2xl font-semibold tracking-tight">Ask your documents anything</h1><p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">Upload a document, then ask a question. The assistant retrieves relevant context before responding.</p></div> }
function MessageBubble({ message }: { message: ChatMessage }) { const assistant = message.role === "assistant"; return <article className={`flex gap-3 ${assistant ? "" : "justify-end"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${assistant ? "bg-zinc-100 text-zinc-800" : "bg-zinc-950 text-white"}`}><p className="whitespace-pre-wrap">{message.content}</p>{assistant && message.sources && message.sources.length > 0 && <details className="mt-3 border-t border-zinc-200 pt-2 text-xs text-zinc-500"><summary className="cursor-pointer">Sources ({message.sources.length})</summary><ul className="mt-2 space-y-1">{message.sources.slice(0, 3).map((source, index) => <li key={`${source.filename}-${index}`} className="truncate">{source.filename ?? "Document"}</li>)}</ul></details>}</div></article> }
