"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faHeart } from "@fortawesome/free-solid-svg-icons";
import PhotoTileImage from "./PhotoTileImage";
import PhotoModal from "./PhotoModal";

export type PhotoTile = {
  id: string;
  title: string;
  location: string | null;
  filmed_at: string | null;
  r2_url: string;
  candidates: string[];
  likes_count: number;
};

type PhotoDateGroupProps = {
  sectionId: string;
  dateLabel: string;
  photos: PhotoTile[];
};

export default function PhotoDateGroup({ sectionId, dateLabel, photos }: PhotoDateGroupProps) {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<PhotoTile | null>(null);
  const gridId = `photo-grid-${sectionId}`;
  const headingId = `photos-date-${sectionId}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5 pb-2 border-b border-taru-cream">
        <h2 id={headingId} className="font-heading text-xl text-taru-green shrink-0 min-w-0">
          {dateLabel}
        </h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-taru-green bg-taru-cream/40 hover:bg-taru-cream/70 transition-colors"
          aria-expanded={open}
          aria-controls={gridId}
        >
          <span>{open ? "Collapse" : "Expand"}</span>
          <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      {open && (
        <div
          id={gridId}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          role="region"
          aria-labelledby={headingId}
        >
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setSelected(photo)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-taru-cream text-left"
            >
              <PhotoTileImage candidates={photo.candidates} alt={photo.title} />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold leading-tight">{photo.title}</p>
                  {photo.location && (
                    <p className="text-white/80 text-xs">{photo.location}</p>
                  )}
                </div>
              </div>

              {/* Like count badge — always visible if > 0 */}
              {photo.likes_count > 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  <FontAwesomeIcon icon={faHeart} className="h-3 w-3 text-red-400" />
                  <span>{photo.likes_count}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <PhotoModal
          id={selected.id}
          title={selected.title}
          location={selected.location}
          filmed_at={selected.filmed_at}
          r2_url={selected.r2_url}
          candidates={selected.candidates}
          likes_count={selected.likes_count}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
