import Link from "next/link";
import { LookifyWordmark } from "@/components/landing/lookify-wordmark";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-md flex-1">
        <Link
          href="/"
          className="mb-10 inline-block transition-opacity hover:opacity-80"
        >
          <LookifyWordmark className="h-auto w-[180px] text-foreground [&_span]:text-foreground" />
        </Link>

        <div className="border-2 border-border bg-card p-6 shadow-md sm:p-8">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
