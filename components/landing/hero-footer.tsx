"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { LandingAuthLinks } from "./landing-auth-links";
import { LookifyLogo } from "./logo";

const FEATURES = [
  "Virtual Cloth Try-On",
  "Makeup & Beauty AI",
  "Background Remove & Change",
  "Hair Color & Style",
  "Photo Enhancement",
  "Face Swap & Avatar Gen",
] as const;

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260725_114042_d2ed2a89-f2fa-449b-9609-da456344257b.mp4";

export function HeroFooter({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  return (
    <section
      id="lookify-footer-hero"
      className="relative h-screen w-full overflow-hidden bg-black text-white"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover lg:scale-[1.2]"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="relative z-10 flex h-full flex-col px-5 sm:px-6 md:px-10 lg:px-14">
        <header className="flex items-center justify-between py-6">
          <LookifyLogo />
          <nav className="hidden items-center gap-6 text-sm tracking-wide md:flex lg:gap-8">
            {["FEATURES", "EDITOR", "GALLERY", "API", "DOCS"].map((link) => (
              <a
                key={link}
                href="#"
                className="transition-opacity hover:opacity-70"
              >
                {link}
              </a>
            ))}
            <LandingAuthLinks variant="dark" isAuthenticated={isAuthenticated} />
          </nav>
          <div className="md:hidden">
            <LandingAuthLinks variant="dark" isAuthenticated={isAuthenticated} />
          </div>
        </header>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          <div>
            <h2 className="text-lg leading-tight tracking-wide md:text-xl">
              <span className="font-normal">LOOKIFY</span>
              <br />
              <span className="font-pixel text-2xl md:text-3xl">STUDIO</span>
            </h2>
            <span className="mt-3 block text-[10px] text-white/50">*</span>
            <p className="font-pixel mt-1 text-xs leading-relaxed text-white/60">
              Lookify is my
              <br />
              AI fashion photo editor -
              <br />
              built with Next.js, YouCam
              <br />
              API &amp; InsForge
            </p>
          </div>

          <div className="text-right lg:text-left">
            <h2 className="text-lg leading-tight tracking-wide md:text-xl">
              <span className="font-normal">AI FASHION</span>
              <br />
              <span className="font-pixel text-2xl md:text-3xl">
                PHOTO EDITOR
              </span>
            </h2>
          </div>

          <div>
            <p className="font-pixel mb-3 text-base uppercase tracking-widest text-white/50">
              What I Do
            </p>
            <p className="max-w-[220px] text-sm leading-relaxed text-white/90">
              I create AI-powered fashion photo editing experiences for brands
              and creators
            </p>
          </div>

          <div className="text-right lg:text-left">
            <p className="font-pixel mb-3 text-base uppercase tracking-widest text-white/50">
              Features
            </p>
            <ul className="space-y-0.5 text-sm leading-relaxed text-white/90">
              {FEATURES.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1" />

        <div className="pb-4">
          <div className="grid grid-cols-1 items-end gap-4 sm:gap-6 lg:grid-cols-2">
            <h2
              className="text-3xl font-normal uppercase tracking-wide sm:text-4xl md:text-5xl lg:text-[3.75rem] xl:text-[4.25rem]"
              style={{ lineHeight: 0.72 }}
            >
              TRANSFORM YOUR
              <br />
              <span className="font-pixel inline-block align-baseline text-[1.25em] font-normal leading-none">
                LOOKS WITH
              </span>
              <br />
              AI FASHION &amp;
              <br />
              <span className="font-pixel inline-block align-baseline text-[1.25em] font-normal leading-none">
                EDITING
              </span>
            </h2>

            <div className="flex flex-col justify-end gap-4 sm:gap-6">
              <button
                type="button"
                className="flex items-center gap-3 self-start rounded-[12px] border border-white/30 bg-white/5 px-6 py-3 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <Play size={14} fill="white" />
                <span className="text-sm tracking-wider">TRY DEMO</span>
              </button>

              <div className="flex flex-wrap items-stretch gap-2 self-start text-sm text-white/80 sm:gap-3 lg:self-end">
                <div className="flex items-center gap-2 bg-[#0B0B0B] px-3 py-2 sm:px-4">
                  <span className="text-sm font-bold tracking-tight sm:text-base">
                    YouCam
                  </span>
                  <span className="text-xs text-white/50">API</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0B0B0B] px-3 py-2 sm:px-4">
                  <span className="text-lg font-bold sm:text-xl">Next.js</span>
                  <span className="text-xs text-white/50">16</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0B0B0B] px-3 py-2 sm:px-4">
                  <span className="text-[10px] font-bold tracking-tight sm:text-xs">
                    InsForge
                  </span>
                  <span className="text-xs text-white/50">AI</span>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-4 grid grid-cols-1 gap-2 pt-4 sm:mt-5 sm:grid-cols-2 sm:gap-4">
            <p className="text-xs text-white/60">
              Open to demos, integrations, and collaboration.{" "}
              <Link
                href={isAuthenticated ? "/dashboard" : "/auth/sign-up"}
                className="text-red-500 transition-colors hover:text-red-400"
              >
                {isAuthenticated ? "Open dashboard" : "Start editing"}
              </Link>
            </p>
            <p className="text-xs text-white/60 sm:text-right">
              30+ AI tools • Virtual try-on • Beauty &amp; fashion
            </p>
          </footer>
        </div>
      </div>
    </section>
  );
}
