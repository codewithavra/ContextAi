import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "processing", "ready", "failed"],
      default: "queued",
      index: true,
    },
    error: {
      type: String,
    },
  },
  { timestamps: true },
);

export const DocumentModel = mongoose.model("Document", documentSchema);
