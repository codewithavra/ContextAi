import type { Document, Types } from "mongoose";

export type DocumentStatus = "queued" | "ready" | "processing" | "failed";
export interface ParsedText {
  text: string;
  metadata: {
    fileName: string;
    source: string;
    fileType: "pdf" | "txt" | "docx";
    charCount: number;
  };
}
export type PersonaKey =
  | "default"
  | "academic"
  | "friendly"
  | "expert"
  | "socratic"
  | "concise"
  | "technical";

export interface IChat extends Document {
  userId: string;
  title: string;
  persona: PersonaKey;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageSource {
  documentId: Types.ObjectId;
  filename: string;
  text: string;
  score: number;
}

export interface IChatMessage extends Document {
  userId: string;
  chatId: Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  sources: IMessageSource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument extends Document {
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  error?: string;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentChunk extends Document {
  userId: string;
  documentId: Types.ObjectId;
  fileName: string;
  text: string;
  embedding: number[];
  chunkIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChunkDocument {
  text: string;
  embedding: number[];       // number[] guaranteed — undefined slots are filtered below
  userId: string;
  documentId: string;
  fileName: string;
  fileType: string;
  chunkIndex: number;
  source: string;
  charCount: number;
}
