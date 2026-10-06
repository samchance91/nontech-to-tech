import { Brand } from "@/components/brand";

export const metadata = { title: "Verify a certificate" };

// Phase 7 looks the id up and shows valid / revoked.
export default async function VerifyPage({ params }: PageProps<"/verify/[id]">) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <Brand />
      <h1 className="mt-6 text-2xl font-semibold">Verify a certificate</h1>
      <p className="mt-2 break-all text-muted-foreground">Certificate {id}</p>
    </main>
  );
}
