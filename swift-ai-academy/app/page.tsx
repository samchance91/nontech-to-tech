import { Brand } from "@/components/brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LearnerHome() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:py-16">
      <Brand />
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in with the link your institution sent you. It opens your institution&apos;s sign-in page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Lost the link? Ask your institution coordinator to resend your invite.
        </CardContent>
      </Card>
    </main>
  );
}
