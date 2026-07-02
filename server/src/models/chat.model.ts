import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
  },
  { timestamps: true },
);

export const ChatModel = mongoose.model("Chat", chatSchema);
