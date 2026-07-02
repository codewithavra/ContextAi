import { Schema } from "mongoose";

const chatMessaheSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: [
      {
        documentId: {
          type: Schema.Types.ObjectId,
          ref: "Document",
        },
        filename: String,
        text: String,
        score: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);
