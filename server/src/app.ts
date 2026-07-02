import e from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config";
import { auth } from "./auth";


export const app = e();

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(e.json({ limit: "10kb" }));

app.use(
  e.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

app.use(
  cors({
    credentials: true,
    origin: env.CORS_ORIGIN,
  }),
);
