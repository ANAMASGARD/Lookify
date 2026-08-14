import Link from "next/link";
import { cn } from "@/lib/utils";

type LandingAuthLinksProps = {
  className?: string;
  variant?: "hero" | "dark";
  isAuthenticated?: boolean;
};

/** Explicit px radius — theme sets --radius: 0 so rounded-* utilities stay square. */
const retroBase =
  "font-pixel inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[12px] border-2 px-5 py-2.5 text-xs uppercase leading-none tracking-[0.1em] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-px active:translate-y-0 sm:min-h-11 sm:rounded-[14px] sm:px-6 sm:py-3 sm:text-sm";

export function LandingAuthLinks({
  className,
  variant = "hero",
  isAuthenticated = false,
}: LandingAuthLinksProps) {
  const isHero = variant === "hero";

  if (isAuthenticated) {
    return (
      <div
        className={cn(
          "pointer-events-auto flex shrink-0 items-center gap-2.5 sm:gap-3",
          className,
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            retroBase,
            isHero
              ? "border-black bg-primary text-black shadow-[2px_2px_0_0_#000] hover:bg-primary-hover hover:shadow-[3px_3px_0_0_#000]"
              : "border-black bg-primary text-black shadow-[2px_2px_0_0_#000] hover:bg-primary-hover",
          )}
        >
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-auto flex shrink-0 items-center gap-2.5 sm:gap-3",
        className,
      )}
    >
      <Link
        href="/auth/sign-in"
        className={cn(
          retroBase,
          isHero
            ? "border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000]"
            : "border-white bg-black/80 text-white shadow-[2px_2px_0_0_#fff] hover:bg-black",
        )}
      >
        Sign in
      </Link>
      <Link
        href="/auth/sign-up"
        className={cn(
          retroBase,
          isHero
            ? "border-black bg-primary text-black shadow-[2px_2px_0_0_#000] hover:bg-primary-hover hover:shadow-[3px_3px_0_0_#000]"
            : "border-black bg-primary text-black shadow-[2px_2px_0_0_#000] hover:bg-primary-hover",
        )}
      >
        Sign up
      </Link>
    </div>
  );
}
