# Lookify — Project Memory

## Project overview

**Lookify** is a full-stack AI fashion photo editor SaaS built with Next.js, YouCam API, and InsForge.

- **Repo:** `/home/linux/Desktop/lookify` · GitHub `ANAMASGARD/Lookify`
- **Stack:** Next.js 16.3.1, React 19, Tailwind CSS 4, GSAP 3.15, Motion 13, shadcn/ui (partial)
- **Backend:** InsForge (Postgres BaaS, auth, storage)
- **Positioning:** AI fashion photo editor — virtual try-on, makeup transfer, beauty tools for brands and creators
- **Last updated:** 2026-08-14 — auth, landing CTAs, InsForge Lookify-AI, rounded-button rule

---

## How to run

```bash
cd /home/linux/Desktop/lookify
npm install          # first time
npm run dev          # http://localhost:3000
npm run build
npm run start
```

Restart dev server after changing `.env.local`. Hard refresh (`Ctrl+Shift+R`) if landing looks stale.

**Required `.env.local` keys:** `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `INSFORGE_API_KEY` (see `.env.example`).

---

## InsForge backend (Lookify-AI — current)

| Field | Value |
|-------|-------|
| Project | **Lookify-AI** |
| Project ID | `f9c04c7b-2ecd-49ac-9698-b28a847859be` |
| App key | `wze4g6x6` |
| Region | `ap-southeast` |
| API base | `https://wze4g6x6.ap-southeast.insforge.app` |
| Dashboard | https://insforge.dev/dashboard/project/f9c04c7b-2ecd-49ac-9698-b28a847859be |

**Deprecated:** earlier `lookify` project in Personal Org (`468921e5-0c2a-43b6-8f11-bc8f00627f1f`, us-east).

### Setup done (2026-08-14)

- Logged into InsForge CLI; linked repo via `npx @insforge/cli link --project-id f9c04c7b-...`
- Installed skills globally: `insforge`, `insforge-cli`, `insforge-debug`, `insforge-integrations`, `find-skills`
- Migration applied: `migrations/*_create-users-table.sql` — `public.users` with RLS
- `insforge.toml` — OAuth redirect URLs for localhost
- `@insforge/sdk@latest` installed
- CLI config: `.insforge/project.json` (gitignored)
- Helpers: `lib/insforge/server.ts`, `lib/insforge/config.ts`, `proxy.ts` (session refresh)

### Backend state

- **Auth:** Google OAuth + email/password; email verification (6-digit code) required for email signup
- **Database:** `public.users` table (profile sync on first signup)
- **Storage / functions / realtime:** not configured yet

---

## Auth implementation (2026-08-14)

### Routes

| Route | Purpose |
|-------|---------|
| `/auth/sign-in` | Email/password + Google OAuth |
| `/auth/sign-up` | Register + 6-digit verification + Google |
| `/api/auth/google` | **GET** — starts Google OAuth (307; sets PKCE cookie) |
| `/api/auth/callback` | OAuth callback → `/dashboard` |
| `/api/auth/refresh` | Session refresh |
| `/dashboard` | Protected “coming soon” page |

### Key files

| File | Purpose |
|------|---------|
| `lib/auth/actions.ts` | Server actions: signIn, signUp, verifyEmail, signOut |
| `lib/auth/ensure-user-profile.ts` | Upserts `public.users` on first signup (admin client + `INSFORGE_API_KEY`) |
| `lib/insforge/server.ts` | `createInsForgeServerClient()` |
| `components/auth/sign-in-form.tsx`, `sign-up-form.tsx` | Auth forms |
| `components/auth/auth-shell.tsx` | Shared auth page layout |
| `components/auth/google-oauth-link.tsx` | Plain `<a href="/api/auth/google">` — **not** Next `<Link>` |
| `app/api/auth/google/route.ts` | OAuth init route (replaced broken Server Action approach) |
| `proxy.ts` | InsForge `updateSession()` (replaces deprecated middleware pattern) |

### Auth behavior

- **Google OAuth:** working — use full navigation via `<a>` or `GoogleOAuthLink` (RSC prefetch on `<Link>` breaks 307 redirect)
- **Email signup:** requires SMTP for verification codes; Google is reliable path until SMTP configured
- **Landing signed-in state:** `app/page.tsx` checks auth → `ScrollLanding isAuthenticated={...}`
  - Signed out: **Sign in** + **Sign up**
  - Signed in: **Dashboard** only → `/dashboard`

### Errors fixed this session

| Issue | Cause | Fix |
|-------|-------|-----|
| `oauth_failed` | Server Action for OAuth init | `GET /api/auth/google` route handler |
| RSC prefetch on Google button | `<Link>` to redirect route | `GoogleOAuthLink` with plain `<a>` |
| Landing buttons broken/invisible | Inside `mix-blend-exclusion` | Auth CTAs outside blend layer |
| Missing hero portrait | Videos hidden until both loaded | Show on first load + 4s fallback |
| Rounded corners not showing | `--radius: 0` in globals.css | Explicit `rounded-[12px]` on buttons |

---

## Landing page

### Current flow (`/` → `ScrollLanding`)

| Phase | Behavior |
|-------|----------|
| **Hero (0–100vh)** | Dual CloudFront videos, cursor-scrub desktop, auto-alternate mobile. Decorative UI uses `mix-blend-exclusion`. Auth buttons **outside** blend layer. |
| **Gallery** | Black panel slides up (GSAP). 10 archive images; RAF card scale. |
| **Outro** | White overlay, product info, pill **view**, footer fade. |
| **Footer hero** | `HeroFooter` — pixel font, FEATURES/EDITOR nav, auth CTAs, TRY DEMO. |

### Landing auth CTAs

- **Component:** `components/landing/landing-auth-links.tsx`
- Retro pixel pills: black border, offset shadow, `min-h-10` / `sm:min-h-11`
- Used in scroll hero header and footer nav (via `ScrollLanding` + `HeroFooter`)
- Hamburger + `[ CART ]` remain inside `mix-blend-exclusion`

### Key landing files

| File | Purpose |
|------|---------|
| `components/landing/scroll-landing.tsx` | Main scroll orchestrator |
| `components/landing/hero-footer.tsx` | Bottom studio hero |
| `components/landing/landing-auth-links.tsx` | Sign in / Sign up / Dashboard pills |
| `components/landing/lookify-wordmark.tsx` | **lookify** + circled R |
| `lib/landing/constants.ts` | Video + gallery URLs |

### Removed

- `components/landing/hero-landing.tsx` — do not recreate

---

## UI rule — ALL buttons must have rounded corners

**Why:** `app/globals.css` sets `:root { --radius: 0 }`. Theme tokens `--radius-lg`, `--radius-2xl`, etc. all resolve to **0px**. Classes like `rounded-lg` / `rounded-2xl` do nothing.

**Rule (agents must follow):**

- Use **explicit** arbitrary radius: `rounded-[12px]`, `sm:rounded-[14px]`, or `rounded-full` for pills
- Do **not** rely on `rounded-lg`, `rounded-xl`, `rounded-2xl`, or shadcn defaults alone
- Reference: `components/landing/landing-auth-links.tsx`, `components/ui/button.tsx` (`rounded-[12px]`), `components/auth/google-oauth-link.tsx`

Also documented in `AGENTS.md` under **UI rule — rounded corners on ALL buttons**.

---

## Current frontend structure

```
app/
  page.tsx              → auth check → ScrollLanding
  auth/sign-in, sign-up
  dashboard/page.tsx    → protected coming soon
  api/auth/google, callback, refresh
  layout.tsx, globals.css

components/
  landing/              → scroll landing + auth CTAs + footer hero
  auth/                 → forms, shell, google-oauth-link
  ui/button.tsx         → shadcn button (explicit rounded-[12px])

lib/
  auth/                 → actions, ensure-user-profile
  insforge/             → server client, config
  landing/              → constants, gallery layout

proxy.ts                → InsForge session refresh
migrations/             → users table
```

---

## Not yet implemented

- Dashboard features beyond “coming soon” shell
- YouCam API integration (copy only on landing)
- Editor routes; FEATURES / TRY DEMO / view pill — mostly `href="#"` placeholders
- Storage buckets for image uploads
- Edge functions for AI processing

---

## Key conventions

- **Standing rule:** After every session, update `AGENTS.md` + this file
- Database inserts: `insert([{ ... }])`
- Users: `auth.users(id)`; RLS with `auth.uid()`
- Storage: persist both `url` and `key`
- Skills: `insforge-cli` for backend; `insforge` for app SDK
- Never commit `.env.local`, `.insforge/project.json`, or API keys
- Landing overlays: `mix-blend-exclusion` on decorative UI, **not** on interactive auth buttons
- **All buttons:** visible rounded corners via explicit px radius (see UI rule above)

---

## Agent briefing

`CLAUDE.md` only `@AGENTS.md` — keep `AGENTS.md` complete; use this file for session history and decisions.
