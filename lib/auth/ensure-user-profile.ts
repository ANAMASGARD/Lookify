import { createAdminClient } from "@insforge/sdk";

type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  profile?: { name?: string | null; avatar_url?: string | null } | null;
};

function resolveUserFields(user: AuthUser) {
  return {
    email: user.email ?? "",
    name: user.name ?? user.profile?.name ?? null,
    avatar_url: user.avatar_url ?? user.profile?.avatar_url ?? null,
  };
}

function getAdminClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Missing INSFORGE_API_KEY. Add it to .env.local for server-side profile sync.",
    );
  }

  return createAdminClient({ baseUrl, apiKey });
}

export async function ensureUserProfile(
  user: AuthUser,
  authProvider: "email" | "google",
) {
  const insforge = getAdminClient();

  const { data: existing } = await insforge.database
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return { created: false };
  }

  const fields = resolveUserFields(user);

  const { error } = await insforge.database.from("users").insert([
    {
      id: user.id,
      email: fields.email,
      name: fields.name,
      avatar_url: fields.avatar_url,
      auth_provider: authProvider,
    },
  ]);

  if (error) {
    throw new Error(error.message ?? "Failed to save user profile");
  }

  return { created: true };
}
