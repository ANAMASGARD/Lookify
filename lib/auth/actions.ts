"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";
import { getAppUrl } from "@/lib/insforge/config";

export type AuthActionState = {
  error?: string;
  needsVerification?: boolean;
  email?: string;
  success?: boolean;
};

async function getAuthActions() {
  return createAuthActions({ cookies: await cookies() });
}

function authErrorMessage(error: { message?: string } | null | undefined) {
  return error?.message ?? "Something went wrong. Please try again.";
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const auth = await getAuthActions();
  const { data, error } = await auth.signInWithPassword({ email, password });

  if (error) {
    return { error: authErrorMessage(error) };
  }

  const user = data?.user;
  if (!user?.id) {
    return { error: "Sign in failed. Please try again." };
  }

  await ensureUserProfile(user, "email");
  redirect("/dashboard");
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const appUrl = getAppUrl();
  const auth = await getAuthActions();
  const { data, error } = await auth.signUp({
    email,
    password,
    name,
    redirectTo: `${appUrl}/auth/sign-in`,
  });

  if (error) {
    return { error: authErrorMessage(error) };
  }

  const user = data?.user;
  const needsVerification = Boolean(
    (data as { requireEmailVerification?: boolean } | null)
      ?.requireEmailVerification,
  );

  if (needsVerification) {
    return { needsVerification: true, email };
  }

  if (user?.id) {
    await ensureUserProfile(user, "email");
    redirect("/dashboard");
  }

  return { error: "Sign up failed. Please try again." };
}

export async function verifyEmailAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!email || !otp) {
    return { error: "Email and verification code are required." };
  }

  const auth = await getAuthActions();
  const { data, error } = await auth.verifyEmail({ email, otp });

  if (error) {
    return { error: authErrorMessage(error) };
  }

  const user = data?.user;
  if (!user?.id) {
    return { error: "Verification failed. Please try again." };
  }

  await ensureUserProfile(user, "email");
  redirect("/dashboard");
}

export async function signOutAction() {
  const auth = await getAuthActions();
  await auth.signOut();
  redirect("/");
}
