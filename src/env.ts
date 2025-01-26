import { z } from "zod";

export const envSchema = z.object({
  AUTH_USERNAME: z.string(),
  AUTH_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
