import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth/minimal";
import { username } from "better-auth/plugins";
import mongoose from "mongoose";

import type { Db } from "mongodb";
import { env } from "../config";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: mongodbAdapter(mongoose.connection.db as unknown as Db),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username({
      minUsernameLength: 5,
      maxUsernameLength: 25,
      displayUsernameValidator: (displayUsername) => {
        // Allow only alphanumeric characters, underscores, and hyphens
        return /^[a-zA-Z0-9_-]+$/.test(displayUsername);
      },
    }),
  ],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});