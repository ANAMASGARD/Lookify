"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, verifyEmailAction } from "@/lib/auth/actions";
import { GoogleOAuthLink } from "@/components/auth/google-oauth-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, {});
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyEmailAction,
    {},
  );

  if (state.needsVerification && state.email) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit verification code to{" "}
          <span className="font-medium text-foreground">{state.email}</span>.
          Enter it below to finish creating your account.
        </p>

        {verifyState.error && (
          <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {verifyState.error}
          </div>
        )}

        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="email" value={state.email} />
          <div className="space-y-2">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={verifyPending}
            className="h-11 w-full border-2 border-border shadow-sm"
          >
            {verifyPending ? "Verifying…" : "Verify & continue"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {state.error && (
        <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            minLength={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            minLength={6}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="h-11 w-full border-2 border-border shadow-sm"
        >
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <GoogleOAuthLink />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
