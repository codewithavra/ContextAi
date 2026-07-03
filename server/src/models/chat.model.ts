import mongoose, { Schema, type Document } from "mongoose";
import { PERSONA_KEYS } from "../personas";


export interface IChat extends Document {
  userId: string;
  title: string;
  persona: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
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
    persona: {
      type: String,
      enum: PERSONA_KEYS,
      default: "default",
    },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model<IChat>("Chat", chatSchema);