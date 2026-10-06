import { Brand } from "@/components/brand";

export const metadata = { title: "Back-office" };

// Phase 1 adds back-office sign-in and the server-side back_office role check.
export default function AdminHome() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <Brand />
      <h1 className="mt-6 text-2xl font-semibold">Back-office</h1>
      <p className="mt-2 text-muted-foreground">Sign-in arrives in Phase 1.</p>
    </main>
  );
}
