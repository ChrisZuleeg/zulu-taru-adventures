import { supabase, hasSupabaseEnv, MediaItem } from "@/lib/supabase";
import {
  driveDirectImageUrl,
  driveThumbnailUrl,
  imageProxyJpegUrl,
} from "@/lib/drive";
import PhotoDateGroup, { type PhotoTile } from "./PhotoDateGroup";

export const revalidate = 60;

function isHeicLike(url: string | null | undefined): boolean {
  if (!url) return false;
  const normalized = url.toLowerCase();
  return normalized.includes(".heic") || normalized.includes(".heif");
}

function buildImageCandidates(photo: MediaItem): string[] {
  const hasHeicSource = isHeicLike(photo.thumbnail_url) || isHeicLike(photo.r2_url);
  const candidates = hasHeicSource
    ? [
        driveThumbnailUrl(photo.thumbnail_url || ""),
        driveDirectImageUrl(photo.thumbnail_url || ""),
        driveThumbnailUrl(photo.r2_url),
        driveDirectImageUrl(photo.r2_url),
        imageProxyJpegUrl(photo.thumbnail_url || ""),
        imageProxyJpegUrl(photo.r2_url),
        photo.thumbnail_url || "",
        photo.r2_url,
      ]
    : [
        photo.thumbnail_url || "",
        driveThumbnailUrl(photo.thumbnail_url || ""),
        driveThumbnailUrl(photo.r2_url),
        driveDirectImageUrl(photo.r2_url),
        imageProxyJpegUrl(photo.thumbnail_url || ""),
        imageProxyJpegUrl(photo.r2_url),
        photo.r2_url,
      ];

  return candidates.filter(Boolean);
}

/** Calendar day in local timezone — stable group + sort key */
function dayKey(filmedAt: string | null): string {
  if (!filmedAt) return "__undated__";
  const d = new Date(filmedAt);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateLabelForDayKey(dayKey: string): string {
  if (dayKey === "__undated__") return "Undated";
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Newest capture time first; items without filmed_at last; tie-break with created_at */
function sortByCaptureDateDesc(photos: MediaItem[]): MediaItem[] {
  return [...photos].sort((a, b) => {
    const aHas = Boolean(a.filmed_at);
    const bHas = Boolean(b.filmed_at);
    if (!aHas && !bHas) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (!aHas) return 1;
    if (!bHas) return -1;
    const diff = new Date(b.filmed_at!).getTime() - new Date(a.filmed_at!).getTime();
    if (diff !== 0) return diff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function buildPhotoSections(photos: MediaItem[]) {
  const sorted = sortByCaptureDateDesc(photos);
  const groups = new Map<string, MediaItem[]>();
  for (const item of sorted) {
    const key = dayKey(item.filmed_at);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const keys = Array.from(groups.keys()).filter((k) => k !== "__undated__");
  keys.sort((a, b) => b.localeCompare(a));
  const orderedKeys = [...keys];
  if (groups.has("__undated__")) orderedKeys.push("__undated__");

  return orderedKeys.map((key) => {
    const items = groups.get(key)!;
    const tiles: PhotoTile[] = items.map((photo) => ({
      id: photo.id,
      title: photo.title,
      location: photo.location,
      r2_url: photo.r2_url,
      candidates: buildImageCandidates(photo),
    }));
    const sectionId = key === "__undated__" ? "undated" : key;
    return {
      sectionId,
      dateLabel: dateLabelForDayKey(key),
      photos: tiles,
    };
  });
}

export default async function Photos() {
  let photos: MediaItem[] | null = null;

  if (supabase) {
    const { data } = await supabase
      .from("media")
      .select("*")
      .eq("type", "photo")
      .order("filmed_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    photos = (data as MediaItem[]) || [];
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">
        Photos
      </h1>
      <p className="text-taru-brown italic text-lg mb-12">
        A gallery of every stop along the way
      </p>
      {!hasSupabaseEnv && (
        <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          Supabase is not configured in this environment yet, so photos cannot
          be loaded.
        </div>
      )}

      {!photos || photos.length === 0 ? (
        <div className="bg-taru-cream rounded-2xl p-10 text-center">
          <p className="font-heading text-2xl text-taru-green font-bold mb-3">
            Gallery coming soon.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Photos will appear here automatically as the trip unfolds.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {buildPhotoSections(photos).map(({ sectionId, dateLabel, photos: tiles }) => (
            <PhotoDateGroup
              key={sectionId}
              sectionId={sectionId}
              dateLabel={dateLabel}
              photos={tiles}
            />
          ))}
        </div>
      )}
    </div>
  );
}
