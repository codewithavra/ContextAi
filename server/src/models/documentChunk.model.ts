import mongoose, { Schema } from "mongoose";

const documentChunkSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export const DocumentChunkModel = mongoose.model(
  "DocumentChunk",
  documentChunkSchema,
);
