import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";
import { getAppUrl } from "@/lib/insforge/config";

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl();
  const code = request.nextUrl.searchParams.get("insforge_code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError || !code) {
    const detail = oauthError ? encodeURIComponent(oauthError) : undefined;
    return NextResponse.redirect(
      new URL(
        `/auth/sign-in?error=oauth_failed${detail ? `&detail=${detail}` : ""}`,
        request.url,
      ),
    );
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("insforge_code_verifier")?.value;

  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=missing_verifier", request.url),
    );
  }

  const response = NextResponse.redirect(new URL("/dashboard", appUrl));
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.user) {
    const detail = encodeURIComponent(
      error?.message ?? "OAuth code exchange failed.",
    );
    return NextResponse.redirect(
      new URL(`/auth/sign-in?error=exchange_failed&detail=${detail}`, appUrl),
    );
  }

  try {
    await ensureUserProfile(data.user, "google");
  } catch (profileError) {
    const detail = encodeURIComponent(
      profileError instanceof Error
        ? profileError.message
        : "Failed to save user profile.",
    );
    return NextResponse.redirect(
      new URL(`/auth/sign-in?error=exchange_failed&detail=${detail}`, appUrl),
    );
  }

  response.cookies.delete("insforge_code_verifier");

  return response;
}
