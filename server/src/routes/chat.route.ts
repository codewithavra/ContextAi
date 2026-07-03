import { Router } from "express";
import { requiredAuth } from "../middleware";
import { askQuestion, createChat, getChatMessages, updateChatPersona } from "../controllers";
import { listPersonas } from "../personas";

export const ChatRouter = Router();

// GET /api/v1/chats/personas — list all available personas (no auth needed)
ChatRouter.get("/personas", (_req, res) => {
  res.json({ success: true, data: listPersonas() });
});

ChatRouter.post("/", requiredAuth, createChat);
ChatRouter.post("/:chatId/messages", requiredAuth, askQuestion);
ChatRouter.get("/:chatId/messages", requiredAuth, getChatMessages);
ChatRouter.patch("/:chatId/persona", requiredAuth, updateChatPersona);