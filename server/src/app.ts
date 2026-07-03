import e from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config";
import { auth } from "./auth";
import { ChatRouter, documentRouter } from "./routes";

export const app = e();

// 1. CORS must be first — Better Auth's preflight OPTIONS also needs it
app.use(
  cors({
    credentials: true,
    origin: env.CORS_ORIGIN,
  }),
);

// 2. Body parsers before any route reads req.body
app.use(e.json({ limit: "10kb" }));
app.use(
  e.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

// 3. Better Auth handler — Express 5 wildcard syntax is correct
app.all("/api/auth/{*any}", toNodeHandler(auth));

// 4. Application routes
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/chats", ChatRouter);