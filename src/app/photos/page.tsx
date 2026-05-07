import { supabase, hasSupabaseEnv, MediaItem } from "@/lib/supabase";
import {
  driveDirectImageUrl,
  driveThumbnailUrl,
  imageProxyJpegUrl,
} from "@/lib/drive";
import PhotoTileImage from "./PhotoTileImage";

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

function groupByDate(items: MediaItem[]) {
  const groups = new Map<string, MediaItem[]>();
  for (const item of items) {
    const key = item.filmed_at
      ? new Date(item.filmed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "Undated";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
}

export default async function Photos() {
  let photos: MediaItem[] | null = null;

  if (supabase) {
    const { data } = await supabase
      .from("media")
      .select("*")
      .eq("type", "photo")
      .order("filmed_at", { ascending: false });
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
          {groupByDate(photos).map(({ date, items }) => (
            <div key={date}>
              <h2 className="font-heading text-xl text-taru-green mb-5 pb-2 border-b border-taru-cream">
                {date}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((photo) => {
                  const imageCandidates = buildImageCandidates(photo);
                  return (
                    <a
                      key={photo.id}
                      href={photo.r2_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-xl bg-taru-cream"
                    >
                      <PhotoTileImage candidates={imageCandidates} alt={photo.title} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                        <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-sm font-semibold">{photo.title}</p>
                          {photo.location && (
                            <p className="text-white/80 text-xs">{photo.location}</p>
                          )}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
