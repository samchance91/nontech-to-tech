import "server-only";
import { z } from "zod";

/** Server-only environment. Importing this from a client component fails the build (server-only). */
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  APP_URL: z.string().url().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Swift AI Academy <no-reply@example.com>"),
});

export type ServerEnv = z.infer<typeof schema>;
let cached: ServerEnv | undefined;
export function serverEnv(): ServerEnv {
  cached ??= schema.parse(process.env);
  return cached;
}
