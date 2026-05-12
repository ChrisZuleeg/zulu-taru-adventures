"use client";

import { useState } from "react";

type VideoLazyEmbedProps = {
  embedSrc: string;
  posterSrc: string;
};

/**
 * Drive preview iframes are very heavy. We show a static poster first and only
 * mount the iframe after the user taps play, so the page stays fast.
 */
export default function VideoLazyEmbed({ embedSrc, posterSrc }: VideoLazyEmbedProps) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={embedSrc}
        className="w-full aspect-video border-0"
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
        title="Video player"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="relative block w-full overflow-hidden rounded-none bg-taru-cream text-left aspect-video group focus:outline-none focus-visible:ring-2 focus-visible:ring-taru-green focus-visible:ring-offset-2"
      aria-label="Play video"
    >
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
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-taru-green shadow-lg ring-2 ring-white/80 transition-transform group-hover:scale-105 group-active:scale-95">
          <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
