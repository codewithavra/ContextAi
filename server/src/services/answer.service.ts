import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { llm } from "../config";
import type { PersonaKey } from "../types";
import { getPersonaPrompt } from "../personas";

interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateAnswer(
  question: string,
  chunks: any[],
  chatHistory: ChatHistoryMessage[] = [],
  persona: PersonaKey = "default"
) {
  if (chunks.length === 0) {
    return "I could not find any relevant information in your uploaded documents to answer this question.";
  }

  const context = chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1} | File: ${chunk.fileName ?? chunk.filename} | Relevance: ${(chunk.score * 100).toFixed(0)}%]\n${chunk.text}`
    )
    .join("\n\n---\n\n");

  // ContextAI identity is kept independent of the chosen response persona.
  // This makes identity questions accurate without changing the document-only policy.
  const systemPrompt = `You are ContextAI, a private document-grounded AI assistant.
- Your name is ContextAI. If asked who you are, identify yourself as ContextAI.
- Do not claim to be a generic unnamed assistant or a different product.

${getPersonaPrompt(persona)}

CONTEXT FROM UPLOADED DOCUMENTS:
${context}`;

  const historyMessages = chatHistory.slice(-6).map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
  );

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    ...historyMessages,
    new HumanMessage(question),
  ]);

  return typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
}
