import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Per-request client acting as the signed-in user (RLS applies). Session cookies carry no max-age (decision 5). */
export async function userClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) {
          const session = { ...options };
          delete session.maxAge;
          delete session.expires;
          try { store.set(name, value, session); } catch { /* called from a server component: middleware refreshes */ }
        }
      },
    },
  });
}
