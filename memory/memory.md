# Lookify — Project Memory

## Project overview

**Lookify** is a full-stack AI fashion photo editor SaaS built with Next.js, YouCam API, and InsForge.

- **Repo:** `/home/linux/Desktop/lookify`
- **Stack:** Next.js 16.3.1, React 19, Tailwind CSS 4, GSAP 3.15, Motion 13, shadcn/ui (partial)
- **Backend:** InsForge (Postgres BaaS, auth, storage)
- **Positioning:** AI fashion photo editor — virtual try-on, makeup transfer, beauty tools for brands and creators

---

## InsForge backend setup (2026-08-14)

### Authentication & project

- Logged into InsForge CLI with user API key
- Created cloud project **lookify** in **Personal Org**
- Linked the **repo root** to the project (not a nested subdirectory)
- Installed InsForge agent skills globally: `insforge`, `insforge-cli`, `insforge-debug`, `insforge-integrations`, `find-skills`

### Project credentials

| Field | Value |
|-------|-------|
| Project ID | `468921e5-0c2a-43b6-8f11-bc8f00627f1f` |
| App key | `avu8nnia` |
| Region | `us-east` |
| API base | `https://avu8nnia.us-east.insforge.app` |
| Dashboard | https://insforge.dev/dashboard/project/468921e5-0c2a-43b6-8f11-bc8f00627f1f |

- CLI config: `.insforge/project.json` (gitignored)
- App env: `.env.local` with `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`
- Template env: `.env.example`

### App integration

- Installed `@insforge/sdk@latest`
- Added `lib/insforge.ts` with `createInsforgeServerClient()` and `getInsforgeServerClient()` helpers
- Updated `AGENTS.md` with InsForge guidance block
- Added `.insforge/` to `.gitignore`

### Cleanup

- Removed accidentally created nested `lookify/` template directory from initial `create` run (note: a nested `lookify/` auth template folder may still exist in repo from later scaffolding)
- Root project retained landing page and shadcn setup

### Backend state (at setup time)

- **Auth:** Google + GitHub OAuth enabled; email verification required
- **Database:** No custom tables yet
- **Storage:** No buckets yet
- **Functions:** None deployed
- **Realtime:** No channels configured
- Backend health check passed; Next.js build verified

---

## Landing page work (2026-08-14)

### Evolution

1. **Static hero (v1)** — Full-viewport Adam Roberts–style portfolio hero adapted for Lookify (`HeroLanding`): video background, four-column meta grid, pixel font (basis33), mobile menu, TRY DEMO button, tech stack chips (YouCam, Next.js, InsForge).
2. **Scroll-driven landing (v2, current)** — Replaced main page with prmpt-style scroll experience (`ScrollLanding`). Previous static hero moved to bottom as `HeroFooter`.
3. **Wordmark fix** — Replaced broken SVG path logo (rendered as garbled “NPIPDB”) with clean text wordmark: **lookify** + circled **R**.

### Current landing flow (`/` → `ScrollLanding`)

| Phase | Behavior |
|-------|----------|
| **Hero (0–100vh scroll)** | Dual CloudFront videos, cursor-scrub on desktop (dead zone at center), auto-alternate on mobile. Fixed UI with `mix-blend-exclusion`. |
| **Gallery** | Black panel slides up (GSAP ScrollTrigger). 10 archive images in scattered grid; cards scale in/out via RAF. |
| **Outro** | White overlay fades in; product info slides up; pill **view** CTA scales in; footer fades in. |
| **Footer hero** | Full-viewport Lookify hero section (`HeroFooter`) after all scroll content. |

### Landing components

| File | Purpose |
|------|---------|
| `components/landing/scroll-landing.tsx` | Main scroll orchestrator (GSAP + RAF + video logic) |
| `components/landing/hero-footer.tsx` | Previous static Lookify hero at page bottom |
| `components/landing/lookify-wordmark.tsx` | Top-left **lookify** wordmark + ® |
| `components/landing/custom-cursor.tsx` | Desktop exclusion-blend custom cursor |
| `components/landing/logo.tsx` | Geometric “L” mark (used in footer hero) |
| `lib/landing/constants.ts` | Video URLs, gallery images, circle symbols |
| `lib/landing/gallery-layout.ts` | Scattered grid layout algorithm |

### Landing copy & branding

- **Wordmark:** lookify (lowercase) + circled R
- **Caption:** Full-stack AI fashion photo editor SaaS powered by YouCam API
- **Product block:** ARCHIVE COLLECTION / "LOOKIFY" / $97,33
- **Nav:** ABOUT · hamburger · [ CART ]
- **Footer (outro):** LOOKIFY (R) 2026 · PRIVACY POLICY
- **Page title:** Lookify — AI Fashion Photo Editor SaaS

### Video & gallery assets

**Hero videos (CloudFront):**
- Left: `.../hf_20260625_154433_532a85d3-dabf-4265-b8bd-19ac6af31842.mp4`
- Right: `.../hf_20260625_154401_a664f076-b971-4557-8728-40ef9ea4c49b.mp4`

**Footer hero video:**
- `.../hf_20260725_114042_d2ed2a89-f2fa-449b-9609-da456344257b.mp4`

**Gallery:** 10 images via `images.higgs.ai` CDN (fashion archive PNGs)

### Technical details

- **Fonts:** Inter (body/footer), Inter Tight 500 (landing UI), basis33 (`.font-pixel` in footer hero)
- **Animations:** GSAP ScrollTrigger (panel slide), Motion (entry stagger), RAF (card scale + outro)
- **Video:** `object-contain` on white bg so portrait is fully visible; panel starts at `translateY(100vh)` so hero isn’t covered on load
- **Dependencies added:** `gsap`, `@gsap/react`, `motion`
- **Config:** `next.config.ts` remote patterns for `images.higgs.ai` and CloudFront

### Removed / superseded

- `components/landing/hero-landing.tsx` — deleted; logic split into `ScrollLanding` + `HeroFooter`

---

## Current frontend structure

```
app/
  page.tsx          → ScrollLanding
  layout.tsx        → Inter + Inter Tight + basis33
  globals.css       → shadcn theme, .font-pixel, .bp-card

components/
  landing/          → scroll landing + footer hero
  ui/button.tsx     → shadcn button

lib/
  insforge.ts       → InsForge server client
  landing/          → constants + gallery layout
  utils.ts

hooks/use-mobile.ts
public/             → beauty, fashion, makeup, AI editing sample assets
```

---

## Not yet implemented

- Auth UI wired into main app flow (nested `lookify/` template has sign-in/sign-up scaffold)
- Database schema (users, edits, looks, sessions)
- Storage buckets for image uploads
- YouCam API integration (landing only references it in copy)
- Edge functions for AI processing
- Protected routes / editor dashboard
- Nav links, TRY DEMO, view CTA — not routed yet (href="#")

---

## Key conventions

- Database inserts use array format: `insert([{ ... }])`
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies
- Storage uploads: persist both `url` and `key`
- Use `insforge-cli` skill for backend/infra; `insforge` skill for app code
- Never commit `.env.local`, `.insforge/project.json`, or API keys
- Landing overlays use `mix-blend-exclusion` and `pointer-events-none`
- Prefer Inter Tight 500 for landing UI typography

---

## How to run

```bash
npm run dev    # http://localhost:3000
npm run build
```

Hard refresh if landing looks stale after changes.
