<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- LOOKIFY:START -->
# Lookify — agent briefing (read this first)

**Standing rule:** After every session that changes the product, update this file (and `memory/memory.md` if needed) so the next agent does not have to scan the whole repo. Keep this briefing current: what exists, where it lives, what not to redo, and what is still unfinished.

**Lookify** is a full-stack AI fashion photo editor SaaS (Next.js + YouCam API + InsForge). Branding is **lookify** (lowercase wordmark), not prmpt / NPIPDB.

- **Repo:** `/home/linux/Desktop/lookify` · GitHub `ANAMASGARD/Lookify` · branch `main`
- **Stack:** Next.js 16.3.1 (App Router), React 19, Tailwind CSS 4, GSAP 3.15, Motion 13, lucide-react, shadcn (partial)
- **Run:** `npm run dev` → http://localhost:3000 · `npm run build` · `npm run start`
- **Env:** copy `.env.example` → `.env.local` (InsForge URL, anon key, app URL, `INSFORGE_API_KEY` server-only)
- **InsForge CLI:** `npx -y @insforge/cli current` · linked project **Lookify-AI** (`f9c04c7b-2ecd-49ac-9698-b28a847859be`)
- **Last updated:** 2026-08-14 — auth, landing CTAs, InsForge Lookify-AI backend

## Run (quick)

```bash
cd /home/linux/Desktop/lookify
npm install          # first time
npm run dev          # http://localhost:3000
```

Restart dev server after changing `.env.local`. Hard refresh (`Ctrl+Shift+R`) if landing looks stale.

**Required `.env.local` keys:** `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `INSFORGE_API_KEY` (see `.env.example`).

## Read these files, not the whole tree

| Need | File |
|------|------|
| This briefing | `AGENTS.md` |
| Session history / decisions | `memory/memory.md` |
| Home page | `app/page.tsx` → `ScrollLanding` |
| Scroll hero + gallery + outro | `components/landing/scroll-landing.tsx` |
| Bottom studio hero (old landing) | `components/landing/hero-footer.tsx` |
| Wordmark | `components/landing/lookify-wordmark.tsx` (text “lookify” + circled R — do not restore SVG letter paths) |
| Custom cursor | `components/landing/custom-cursor.tsx` |
| Footer hero “L” mark | `components/landing/logo.tsx` |
| Video/gallery URLs | `lib/landing/constants.ts` |
| Scattered grid math | `lib/landing/gallery-layout.ts` |
| InsForge server client | `lib/insforge/server.ts` |
| Auth actions | `lib/auth/actions.ts` |
| Auth pages | `app/auth/sign-in`, `app/auth/sign-up` |
| Landing auth CTAs | `components/landing/landing-auth-links.tsx` |
| Google OAuth link (auth pages) | `components/auth/google-oauth-link.tsx` |
| InsForge config helper | `lib/insforge/config.ts` |
| Dashboard (coming soon) | `app/dashboard/page.tsx` |
| Fonts / CSS tokens | `app/layout.tsx`, `app/globals.css` |
| Remote images | `next.config.ts` (`images.higgs.ai`, CloudFront) |

## Landing architecture (`/`)

Four phases in one page:

1. **Hero (scroll 0–100vh)** — Dual CloudFront videos, white bg, `object-contain`. Desktop: cursor-X scrubs video (dead zone at center). Mobile: videos autoplay alternately. Fixed overlays use `mix-blend-exclusion` + `pointer-events-none`. Black gallery panel starts at `translateY(100vh)` so it does not cover the portrait on load.
2. **Gallery** — GSAP ScrollTrigger slides black panel up. 10 archive images; cards `.bp-card` scale via RAF enter/exit.
3. **Outro** — White overlay, product info slides up, pill **view** scales in, footer fades in.
4. **HeroFooter** — Full-viewport Lookify studio section (pixel font, FEATURES/EDITOR nav, SIGN IN/SIGN UP or Dashboard, TRY DEMO).

**Top-right nav:** retro **Sign in** / **Sign up** (or **Dashboard** when logged in) — outside `mix-blend-exclusion`; hamburger + `[ CART ]` stay blended.

**Copy:** caption = YouCam SaaS; product = ARCHIVE COLLECTION / "LOOKIFY" / `$97,33`; nav = ABOUT · hamburger · `[ CART ]`; outro footer = LOOKIFY (R) 2026 · PRIVACY POLICY.

**Fonts:** Inter Tight 500 (landing UI), Inter (footer hero), basis33 via `.font-pixel`.

**Deleted:** `components/landing/hero-landing.tsx` — do not recreate; use `ScrollLanding` + `HeroFooter`.

## Public assets (local samples, not wired to editor yet)

`public/ai-photo-editing-images/`, `beauty-looks/`, `fashion-looks/`, `fashion-samples/`, `makeup-transfer/`, `eye-lens/`, `extras-samples/`, `normal-headshot/`.

## Not built yet (do not assume these exist)

- YouCam API calls (copy only)
- Editor routes; nav / TRY DEMO / view are placeholders
- Dashboard features beyond “coming soon” shell

## Auth (implemented)

| Route | Purpose |
|-------|---------|
| `/auth/sign-in` | Email/password + Google OAuth |
| `/auth/sign-up` | Register + email verification (6-digit code) + Google |
| `/api/auth/google` | Start Google OAuth (307 → Google; sets PKCE cookie) |
| `/api/auth/callback` | OAuth callback → `/dashboard` |
| `/api/auth/refresh` | Session refresh |
| `/dashboard` | Protected “coming soon” page |

- **Email/password:** sign-up → 6-digit email verification (InsForge) → redirect `/dashboard`
- **Google OAuth:** use `<a href="/api/auth/google">` or `GoogleOAuthLink` — **not** Next.js `<Link>` (RSC prefetch breaks on 307)
- **First signup:** `ensureUserProfile()` inserts row into `public.users` (admin client + `INSFORGE_API_KEY`)
- **Landing CTAs:** `app/page.tsx` checks auth server-side → passes `isAuthenticated` to `ScrollLanding`
  - Signed out: **Sign in** + **Sign up** (top-right hero + footer nav)
  - Signed in: **Dashboard** only (links to `/dashboard`)
- Auth buttons sit **outside** `mix-blend-exclusion` on the hero header (solid retro pills; hamburger/cart stay blended)
- Migration applied: `migrations/*_create-users-table.sql` · `insforge.toml` redirect URLs for localhost

## UI rule — rounded corners on ALL buttons

**Critical:** `app/globals.css` sets `:root { --radius: 0 }` and maps `--radius-lg`, `--radius-2xl`, etc. to that value. Tailwind classes like `rounded-lg` / `rounded-2xl` render as **square corners**.

When adding or editing **any** button (landing, auth, dashboard, shadcn):

- **Do** use explicit arbitrary radius: `rounded-[12px]`, `sm:rounded-[14px]`, or `rounded-full` for pills
- **Do not** rely on `rounded-lg`, `rounded-xl`, `rounded-2xl`, or shadcn `Button` default radius alone — they are 0px in this project
- Landing retro buttons: see `components/landing/landing-auth-links.tsx` (`rounded-[12px] sm:rounded-[14px]`, pixel font, black offset shadow)
- When touching `components/ui/button.tsx`, add explicit `rounded-[12px]` (or update theme radii project-wide if design shifts)

## Agent conventions

- Prefer editing existing landing files over adding parallel pages
- Keep overlays `mix-blend-exclusion`; keep panel off-screen until scroll
- **All buttons must have visible rounded corners** (see UI rule above)
- Do not commit `.env.local` or `.insforge/project.json`
- `CLAUDE.md` only `@AGENTS.md` — keep this file complete
- After every session: update this file + `memory/memory.md`
<!-- LOOKIFY:END -->

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **Lookify-AI** (API base `https://wze4g6x6.ap-southeast.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
