import "dotenv/config";

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  BETTER_AUTH_SECRET: requiredEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: requiredEnv("BETTER_AUTH_URL"),

  CORS_ORIGIN: requiredEnv("CORS_ORIGIN"),

  PORT: requiredEnv("PORT"),

  NODE_ENV: requiredEnv("NODE_ENV"),

  GOOGLE_API_KEY: requiredEnv("GOOGLE_API_KEY"),
  GROQ_API_KEY: requiredEnv("GROQ_API_KEY"),

  REDIS_URL: requiredEnv("REDIS_URL"),
  MONGODB_URI: requiredEnv("MONGODB_URI"),

  DB_NAME: requiredEnv("DB_NAME"),
  COLLECTION_NAME: requiredEnv("COLLECTION_NAME"),
  INDEX_NAME: requiredEnv("INDEX_NAME"),

  EMBEDDING_MODEL: requiredEnv("EMBEDDING_MODEL"),
  TEXT_MODEL: requiredEnv("TEXT_MODEL"),

  GITHUB_CLIENT_ID:requiredEnv("GITHUB_CLIENT_ID"),
  GITHUB_CLIENT_SECRET:requiredEnv("GITHUB_CLIENT_SECRET"),

};
