import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z
    .string()
    .default("5000")
    .transform((value) => parseInt(value, 10))
    .pipe(z.number().min(1)),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  TOKEN_TTL_HOURS: z
    .string()
    .default("12")
    .transform((value) => parseInt(value, 10))
    .pipe(z.number().min(1)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Failed to parse environment variables");
}

export const env = parsed.data;
