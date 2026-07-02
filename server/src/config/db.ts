import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(env.MONGODB_URI);

    console.log(`MongoDB connected successfully`);
    console.log(`MongoDB Host : ${connectionInstance.connection.host}`);
  } catch (err: any) {
    console.error(`MongoDB connection error : ${err.message}`);
    process.exit(1)
  }
};
