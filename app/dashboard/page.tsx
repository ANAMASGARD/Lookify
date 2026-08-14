import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import { LookifyWordmark } from "@/components/landing/lookify-wordmark";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user) {
    redirect("/auth/sign-in");
  }

  const user = data.user;
  const displayName =
    (user.profile as { name?: string } | null)?.name ?? undefined;

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-border pb-6">
          <Link href="/">
            <LookifyWordmark className="h-auto w-[160px] text-foreground [&_span]:text-foreground" />
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="border-2 border-border">
              Sign out
            </Button>
          </form>
        </header>

        <main className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Coming soon
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Hi{displayName ? ` ${displayName}` : ""} — your studio dashboard is
              under construction. Virtual try-on, makeup transfer, and saved
              looks will live here.
            </p>
          </div>

          <div className="border-2 border-border bg-card p-6 shadow-md">
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Signed in as
            </p>
            <p className="mt-2 font-medium">{user.email}</p>
          </div>

          <Link
            href="/"
            className="inline-flex text-sm font-medium underline-offset-4 hover:underline"
          >
            ← Back to landing
          </Link>
        </main>
      </div>
    </div>
  );
}
