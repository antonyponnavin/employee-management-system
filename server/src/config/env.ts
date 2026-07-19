import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  SUPER_ADMIN_EMAIL: z.string().email().default("admin@ems.local"),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default("Admin@123")
});

export const env = envSchema.parse(process.env);

