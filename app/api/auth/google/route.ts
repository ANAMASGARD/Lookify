import { NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";
import { getAppUrl, getInsforgePublicConfig } from "@/lib/insforge/config";

export async function GET() {
  const appUrl = getAppUrl();

  try {
    const { baseUrl, anonKey } = getInsforgePublicConfig();
    const insforge = createServerClient({ baseUrl, anonKey });

    const { data, error } = await insforge.auth.signInWithOAuth("google", {
      redirectTo: `${appUrl}/api/auth/callback`,
      skipBrowserRedirect: true,
    });

    if (error || !data.url || !data.codeVerifier) {
      const detail = encodeURIComponent(
        error?.message ?? "Missing OAuth URL or PKCE verifier from InsForge.",
      );
      return NextResponse.redirect(
        `${appUrl}/auth/sign-in?error=oauth_failed&detail=${detail}`,
      );
    }

    const response = NextResponse.redirect(data.url);
    response.cookies.set("insforge_code_verifier", data.codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (err) {
    const detail = encodeURIComponent(
      err instanceof Error ? err.message : "OAuth initialization failed.",
    );
    return NextResponse.redirect(
      `${appUrl}/auth/sign-in?error=oauth_failed&detail=${detail}`,
    );
  }
}
