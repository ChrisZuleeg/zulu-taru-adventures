"use client";

import { useMemo, useState } from "react";

type PhotoTileImageProps = {
  candidates: string[];
  alt: string;
};

export default function PhotoTileImage({ candidates, alt }: PhotoTileImageProps) {
  const safeCandidates = useMemo(
    () => candidates.filter((value, index, array) => value && array.indexOf(value) === index),
    [candidates]
  );
  const [index, setIndex] = useState(0);

  if (safeCandidates.length === 0 || index >= safeCandidates.length) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-taru-cream-dark/30 text-taru-brown px-3 text-center">
        <span className="text-xs font-medium">Preview unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={safeCandidates[index]}
      alt={alt}
      onError={() => setIndex((prev) => prev + 1)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  );
}
