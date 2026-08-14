import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_failed: "Google sign-in was cancelled or failed. Please try again.",
  missing_verifier: "OAuth session expired. Please try signing in again.",
  exchange_failed: "Could not complete Google sign-in. Please try again.",
  missing_env:
    "InsForge environment variables are missing. Restart the dev server after updating .env.local.",
};

export default async function SignInPage({
  searchParams,
}: PageProps<"/auth/sign-in">) {
  const params = await searchParams;
  const errorKey = typeof params.error === "string" ? params.error : undefined;
  const detail =
    typeof params.detail === "string" ? decodeURIComponent(params.detail) : undefined;
  const oauthError = detail
    ? detail
    : errorKey
      ? OAUTH_ERRORS[errorKey]
      : undefined;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your Lookify studio dashboard."
    >
      <SignInForm oauthError={oauthError} />
    </AuthShell>
  );
}
