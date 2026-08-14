"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CustomCursor } from "./custom-cursor";
import { HeroFooter } from "./hero-footer";
import { LandingAuthLinks } from "./landing-auth-links";
import { LookifyWordmark } from "./lookify-wordmark";
import {
  CIRCLE_SYMBOLS,
  ENTRY_EASE,
  GALLERY_IMAGES,
  VIDEO_LEFT,
  VIDEO_RIGHT,
} from "@/lib/landing/constants";
import {
  buildLayout,
  getColumnCount,
  type GalleryCell,
} from "@/lib/landing/gallery-layout";

gsap.registerPlugin(ScrollTrigger);

function buildGrid(cells: GalleryCell[], cols: number): (number | -1)[][] {
  if (cells.length === 0) return [];
  const maxRow = Math.max(...cells.map((c) => c.row)) + 1;
  const grid: (number | -1)[][] = Array.from({ length: maxRow }, () =>
    Array<number | -1>(cols).fill(-1),
  );
  for (const cell of cells) {
    grid[cell.row][cell.col] = cell.imageIndex;
  }
  return grid;
}

function randomSymbol(current: string): string {
  const options = CIRCLE_SYMBOLS.filter((s) => s !== current);
  return options[Math.floor(Math.random() * options.length)] ?? "$";
}

function prefersReducedMotionCheck(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScrollLanding({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const outroInfoRef = useRef<HTMLDivElement>(null);
  const outroBuyRef = useRef<HTMLDivElement>(null);
  const outroFooterRef = useRef<HTMLDivElement>(null);
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const cardOriginsRef = useRef<Map<number, string>>(new Map());

  const [cols, setCols] = useState(4);
  const [videosLoaded, setVideosLoaded] = useState({ left: false, right: false });
  const [heroVisible, setHeroVisible] = useState(false);
  const [circleSymbol, setCircleSymbol] = useState("$");
  const [isTouch, setIsTouch] = useState(false);

  const activeSideRef = useRef<"left" | "right">("right");
  const lastSymbolUpdateRef = useRef(0);
  const rafRef = useRef<number>(0);
  const maxScrollRef = useRef(0);

  const layoutCells = useMemo(() => buildLayout(GALLERY_IMAGES.length, cols), [cols]);
  const grid = useMemo(() => buildGrid(layoutCells, cols), [layoutCells, cols]);

  const bothVideosLoaded = videosLoaded.left && videosLoaded.right;

  const markVideoLoaded = useCallback((side: "left" | "right") => {
    setVideosLoaded((current) => {
      const next = { ...current, [side]: true };
      if (next.left || next.right) {
        setHeroVisible(true);
      }
      return next;
    });
  }, []);

  const getOutroOffset = useCallback(() => {
    return window.innerWidth >= 1024 ? 166 : 132;
  }, []);

  const updateCardScales = useCallback(
    (panelOffset: number, phase2Offset: number) => {
      const vh = window.innerHeight;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const top = rect.top - panelOffset - phase2Offset;
        const bottom = rect.bottom - panelOffset - phase2Offset;
        const origin = cardOriginsRef.current.get(index) ?? "center bottom";

        if (bottom <= 0 || top >= vh) {
          card.style.transform = `scale(0)`;
          card.style.transformOrigin = origin;
          return;
        }

        const enter = Math.min(1, (vh - top) / (vh * 0.6));
        const exit = Math.min(1, bottom / (vh * 0.4));
        const scale = Math.min(enter, exit);
        card.style.transformOrigin = origin;
        card.style.transform = `scale(${scale})`;
      });
    },
    [],
  );

  useEffect(() => {
    const touch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(touch);

    const updateCols = () => setCols(getColumnCount(window.innerWidth));
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  useEffect(() => {
    leftVideoRef.current?.load();
    rightVideoRef.current?.load();

    const fallbackTimer = window.setTimeout(() => {
      setHeroVisible(true);
    }, 4000);

    return () => window.clearTimeout(fallbackTimer);
  }, []);

  useLayoutEffect(() => {
    const spacer = spacerRef.current;
    const panel = panelRef.current;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const outroInfo = outroInfoRef.current;
    const outroBuy = outroBuyRef.current;
    const outroFooter = outroFooterRef.current;

    if (!spacer || !panel || !wrap) return;

    gsap.set(panel, { y: "100vh" });

    const measureAndSetHeight = () => {
      const vh = window.innerHeight;
      const maxScroll = Math.max(0, wrap.scrollHeight - vh);
      maxScrollRef.current = maxScroll;
      spacer.style.height = `${vh + maxScroll + 2 * vh}px`;
      ScrollTrigger.refresh();
    };

    measureAndSetHeight();

    const panelTween = gsap.fromTo(
      panel,
      { y: "100vh" },
      {
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: spacer,
          start: "top top",
          end: "+=100vh",
          scrub: true,
        },
      },
    );

    const tick = () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const maxScroll = maxScrollRef.current;

      if (canvas) {
        canvas.style.visibility = scrollY >= vh ? "hidden" : "visible";
      }

      let panelOffset = 0;
      let phase2Offset = 0;

      if (scrollY <= vh) {
        panelOffset = vh - scrollY;
        wrap.style.transform = "translateY(0)";
      } else {
        phase2Offset = scrollY - vh;
        wrap.style.transform = `translateY(-${phase2Offset}px)`;
      }

      updateCardScales(panelOffset, phase2Offset);

      const outroStart = vh + maxScroll;
      if (scrollY > outroStart) {
        const progress = Math.min(1, (scrollY - outroStart) / (vh - 100));
        if (overlay) overlay.style.opacity = String(progress);
        if (outroInfo) {
          outroInfo.style.transform = `translateY(-${progress * getOutroOffset()}px)`;
        }
        if (outroBuy) {
          outroBuy.style.transform = `scale(${progress})`;
        }
        if (outroFooter) {
          outroFooter.style.opacity = String(progress);
        }
      } else {
        if (overlay) overlay.style.opacity = "0";
        if (outroInfo) outroInfo.style.transform = "translateY(0)";
        if (outroBuy) outroBuy.style.transform = "scale(0)";
        if (outroFooter) outroFooter.style.opacity = "0";
      }

      const now = performance.now();
      if (scrollY > 0 && now - lastSymbolUpdateRef.current > 80) {
        lastSymbolUpdateRef.current = now;
        setCircleSymbol((prev) => randomSymbol(prev));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(() => {
      measureAndSetHeight();
    });
    resizeObserver.observe(wrap);

    return () => {
      cancelAnimationFrame(rafRef.current);
      panelTween.scrollTrigger?.kill();
      panelTween.kill();
      resizeObserver.disconnect();
    };
  }, [cols, grid, getOutroOffset, updateCardScales]);

  const primeVideo = useCallback((video: HTMLVideoElement) => {
    video.pause();
    video.currentTime = 0;
  }, []);

  useEffect(() => {
    if (isTouch || prefersReducedMotionCheck()) return;

    const leftVideo = leftVideoRef.current;
    const rightVideo = rightVideoRef.current;
    if (!leftVideo || !rightVideo || !bothVideosLoaded) return;

    primeVideo(leftVideo);
    primeVideo(rightVideo);

    leftVideo.style.display = "none";
    rightVideo.style.display = "block";
    activeSideRef.current = "right";

    let rafId = 0;
    let mouseX = window.innerWidth / 2;

    const scrub = () => {
      const width = window.innerWidth;
      const center = width / 2;
      const deadZone = Math.max(30, width * 0.05);

      if (Math.abs(mouseX - center) <= deadZone) {
        const active =
          activeSideRef.current === "left" ? leftVideo : rightVideo;
        if (!active.seeking) active.currentTime = 0;
        rafId = requestAnimationFrame(scrub);
        return;
      }

      if (mouseX < center - deadZone) {
        if (activeSideRef.current !== "right") {
          activeSideRef.current = "right";
          leftVideo.style.display = "none";
          rightVideo.style.display = "block";
        }
        if (!rightVideo.seeking && rightVideo.duration) {
          const range = center - deadZone;
          const dist = center - deadZone - mouseX;
          const progress = Math.min(1, Math.max(0, dist / range));
          rightVideo.currentTime = progress * rightVideo.duration;
        }
      } else if (mouseX > center + deadZone) {
        if (activeSideRef.current !== "left") {
          activeSideRef.current = "left";
          rightVideo.style.display = "none";
          leftVideo.style.display = "block";
        }
        if (!leftVideo.seeking && leftVideo.duration) {
          const range = width - (center + deadZone);
          const dist = mouseX - (center + deadZone);
          const progress = Math.min(1, Math.max(0, dist / range));
          leftVideo.currentTime = progress * leftVideo.duration;
        }
      }

      rafId = requestAnimationFrame(scrub);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
    };

    window.addEventListener("mousemove", onMouseMove);
    rafId = requestAnimationFrame(scrub);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isTouch, bothVideosLoaded, primeVideo]);

  useEffect(() => {
    if (!isTouch || prefersReducedMotionCheck()) return;

    const leftVideo = leftVideoRef.current;
    const rightVideo = rightVideoRef.current;
    if (!leftVideo || !rightVideo || !bothVideosLoaded) return;

    const showLeft = () => {
      leftVideo.style.display = "block";
      rightVideo.style.display = "none";
      leftVideo.currentTime = 0;
      void leftVideo.play();
    };

    const showRight = () => {
      leftVideo.style.display = "none";
      rightVideo.style.display = "block";
      rightVideo.currentTime = 0;
      void rightVideo.play();
    };

    const onLeftEnded = () => showRight();
    const onRightEnded = () => showLeft();

    leftVideo.addEventListener("ended", onLeftEnded);
    rightVideo.addEventListener("ended", onRightEnded);

    showLeft();

    return () => {
      leftVideo.removeEventListener("ended", onLeftEnded);
      rightVideo.removeEventListener("ended", onRightEnded);
    };
  }, [isTouch, bothVideosLoaded]);

  const entryTransition = {
    duration: 0.6,
    ease: ENTRY_EASE,
  };

  return (
    <>
      <CustomCursor />

      <div
        id="scroll-spacer"
        ref={spacerRef}
        className="relative select-none bg-white lg:cursor-none"
        style={{ height: "500vh" }}
      >
        <div
          id="outro-overlay"
          ref={overlayRef}
          className="pointer-events-none fixed inset-0 z-[12] bg-white opacity-0"
        />

        <div
          id="main-canvas"
          ref={canvasRef}
          className={`pointer-events-none fixed z-0 overflow-hidden bg-white transition-opacity duration-300 ease-in-out ${
            heroVisible ? "opacity-100" : "opacity-0"
          } max-lg:left-0 max-lg:top-[220px] max-lg:h-[calc(100vh-220px)] max-lg:w-screen lg:inset-0 lg:h-full lg:w-full`}
        >
          <video
            ref={leftVideoRef}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 hidden h-full w-full object-contain object-center"
            onLoadedData={() => {
              if (leftVideoRef.current) primeVideo(leftVideoRef.current);
              markVideoLoaded("left");
            }}
            onCanPlay={() => markVideoLoaded("left")}
            onError={() => markVideoLoaded("left")}
          >
            <source src={VIDEO_LEFT} type="video/mp4" />
          </video>
          <video
            ref={rightVideoRef}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 block h-full w-full object-contain object-center"
            onLoadedData={() => {
              if (rightVideoRef.current) primeVideo(rightVideoRef.current);
              markVideoLoaded("right");
            }}
            onCanPlay={() => markVideoLoaded("right")}
            onError={() => markVideoLoaded("right")}
          >
            <source src={VIDEO_RIGHT} type="video/mp4" />
          </video>
        </div>

        <div
          ref={panelRef}
          className="fixed inset-0 z-10 bg-black will-change-transform"
          style={{ transform: "translate3d(0, 100vh, 0)" }}
        >
          <div
            ref={wrapRef}
            className="w-full"
            style={{ paddingTop: "min(400px, 40vh)" }}
          >
            <div
              className="grid gap-3 px-3 sm:gap-4 sm:px-4 md:gap-5 md:px-6"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {grid.flatMap((row, rowIndex) =>
                row.map((imageIndex, colIndex) => {
                  const origin =
                    colIndex < cols / 2 ? "right bottom" : "left bottom";

                  if (imageIndex === -1) {
                    return (
                      <div
                        key={`empty-${rowIndex}-${colIndex}`}
                        className="aspect-[2/3]"
                      />
                    );
                  }

                  return (
                    <div
                      key={`card-${imageIndex}`}
                      ref={(el) => {
                        if (el) {
                          cardRefs.current[imageIndex] = el;
                          cardOriginsRef.current.set(imageIndex, origin);
                        }
                      }}
                      className="bp-card aspect-[2/3] overflow-hidden"
                      style={{ transform: "scale(0)", transformOrigin: origin }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={GALLERY_IMAGES[imageIndex]}
                        alt={`Lookify archive look ${imageIndex + 1}`}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        <motion.div
          className="pointer-events-none fixed z-20 mix-blend-exclusion left-4 top-4 text-white sm:left-8 sm:top-8 w-[124px] sm:w-[266px] lg:w-[355px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...entryTransition, delay: 0 }}
        >
          <LookifyWordmark className="h-auto w-full" />
        </motion.div>

        <motion.p
          className="pointer-events-none fixed z-20 mix-blend-exclusion left-4 font-medium text-white sm:left-8 w-[calc(100vw-32px)] sm:w-[calc(50vw-48px)] lg:w-[692px] top-[118px] sm:top-[180px] lg:top-[244px] text-xs leading-[140%] tracking-[-0.04em]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...entryTransition, delay: 0.3 }}
        >
          Full-stack AI fashion photo editor SaaS powered by YouCam API. Move
          your cursor left or right to scrub between looks — virtual try-on,
          makeup transfer, and beauty tools for brands and creators.
        </motion.p>

        <motion.header
          className="fixed z-30 flex items-center justify-between left-4 right-4 top-4 sm:left-8 sm:right-8 sm:top-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...entryTransition, delay: 0.15 }}
        >
          <span className="pointer-events-none hidden font-medium uppercase text-white mix-blend-exclusion text-[15px] tracking-[-0.04em] lg:inline">
            ABOUT
          </span>

          <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
            <LandingAuthLinks variant="hero" isAuthenticated={isAuthenticated} />
            <div className="flex shrink-0 items-center gap-4 sm:gap-5 mix-blend-exclusion">
              <svg
                viewBox="0 0 40 40"
                className="pointer-events-none h-6 w-6 sm:h-[30px] sm:w-[30px]"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M0 14H40M0 26H40"
                  stroke="white"
                  strokeWidth="2.5"
                />
              </svg>
              <span className="pointer-events-none whitespace-nowrap font-medium text-white text-[13px] sm:text-[15px] tracking-[-0.04em]">
                [ CART ]
              </span>
            </div>
          </div>
        </motion.header>

        <motion.div
          id="outro-info"
          ref={outroInfoRef}
          data-outro-offset={166}
          className="pointer-events-none fixed z-20 flex mix-blend-exclusion flex-col items-end max-lg:inset-x-0 max-lg:bottom-12 max-lg:items-center lg:right-8 lg:bottom-20 lg:w-[330px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...entryTransition, delay: 0.45 }}
        >
          <div className="mb-3 flex w-[252px] flex-col items-start lg:mb-8 lg:w-full">
            <div className="relative mb-3 flex h-5 w-5 items-center justify-center sm:mb-4 sm:h-[30px] sm:w-[30px]">
              <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full">
                <circle
                  cx="20"
                  cy="20"
                  r="18.75"
                  stroke="white"
                  strokeWidth="2"
                  className="sm:stroke-[2.5]"
                  fill="none"
                />
              </svg>
              <span
                id="circle-symbol"
                className="relative font-medium uppercase text-white text-[10px] tracking-[-0.04em] sm:text-[15px]"
              >
                {circleSymbol}
              </span>
            </div>
            <p className="font-medium uppercase text-white text-xl leading-none tracking-[-0.04em] sm:text-[30px]">
              ARCHIVE COLLECTION
              <br />
              &quot;LOOKIFY&quot;
            </p>
          </div>
          <p className="w-full text-left font-medium text-white text-[60px] leading-none tracking-[-0.04em] sm:text-[80px] lg:text-right">
            $97,33
          </p>
        </motion.div>

        <div
          id="outro-buy"
          ref={outroBuyRef}
          className="pointer-events-none fixed z-20 flex origin-bottom-right items-center justify-center mix-blend-exclusion rounded-[1335px] bg-white max-lg:inset-x-4 max-lg:bottom-[60px] max-lg:h-[100px] lg:right-8 lg:bottom-8 lg:h-[174px] lg:w-[330px]"
          style={{ transform: "scale(0)" }}
        >
          <span className="font-medium lowercase text-white mix-blend-exclusion text-[72px] tracking-[-0.04em] sm:text-[110px]">
            view
          </span>
        </div>

        <footer
          id="outro-footer"
          ref={outroFooterRef}
          className="pointer-events-none fixed bottom-6 left-4 z-20 flex mix-blend-exclusion opacity-0 sm:bottom-8 max-sm:w-[calc(100vw-32px)] max-sm:justify-between sm:gap-20"
        >
          <span className="font-medium uppercase text-white text-[11px] tracking-[-0.02em] sm:text-[13px]">
            LOOKIFY (R) 2026
          </span>
          <span className="font-medium uppercase text-white text-[11px] tracking-[-0.02em] sm:text-[13px]">
            PRIVACY POLICY
          </span>
        </footer>
      </div>

      <HeroFooter isAuthenticated={isAuthenticated} />
    </>
  );
}
