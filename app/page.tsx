import { ScrollLanding } from "@/components/landing/scroll-landing";
import { createInsForgeServerClient } from "@/lib/insforge/server";

export default async function Home() {
  let isAuthenticated = false;

  try {
    const insforge = await createInsForgeServerClient();
    const { data } = await insforge.auth.getCurrentUser();
    isAuthenticated = Boolean(data?.user);
  } catch {
    isAuthenticated = false;
  }

  return <ScrollLanding isAuthenticated={isAuthenticated} />;
}
