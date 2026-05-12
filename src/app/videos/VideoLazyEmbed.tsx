"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";

type VideoLazyEmbedProps = {
  embedSrc: string;
  posterSrc: string;
  /** When true, mount the Drive iframe once the card is mostly in view (unmounts when off-screen to cap load). */
  activateOnScroll?: boolean;
};

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const VISIBLE_RATIO = 0.45;

/**
 * Drive preview iframes are heavy. Default: poster + tap to play.
 * With activateOnScroll: iframe mounts when the block is sufficiently visible,
 * unmounts when scrolled away to cap memory/network. Google may or may not
 * honor autoplay=1 inside the embed; muted autoplay policies still apply.
 */
export default function VideoLazyEmbed({
  embedSrc,
  posterSrc,
  activateOnScroll = false,
}: VideoLazyEmbedProps) {
  const reducedMotion = usePrefersReducedMotion();
  const useScrollActivation = activateOnScroll && !reducedMotion;
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!useScrollActivation) return;
    const el = rootRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        setActive(e.isIntersecting && e.intersectionRatio >= VISIBLE_RATIO);
      },
      { threshold: [0, 0.15, VISIBLE_RATIO, 0.55, 0.75, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [useScrollActivation]);

  const posterInner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- external Drive URLs; avoid image optimizer config */}
      <img
        src={posterSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" aria-hidden />
      {!useScrollActivation && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-taru-green shadow-lg ring-2 ring-white/80 transition-transform group-hover:scale-105 group-active:scale-95">
            <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </span>
        </span>
      )}
    </>
  );

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-hidden rounded-none bg-taru-cream aspect-video"
      aria-label={useScrollActivation ? "Video plays when this area is in view" : undefined}
    >
      {active ? (
        <iframe
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0 bg-black"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          title="Video player"
        />
      ) : useScrollActivation ? (
        <div className="absolute inset-0">{posterInner}</div>
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-taru-green focus-visible:ring-offset-2"
          aria-label="Play video"
        >
          {posterInner}
        </button>
      )}
    </div>
  );
}
