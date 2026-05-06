import { supabase, MediaItem } from "@/lib/supabase";
import { driveThumbnailUrl } from "@/lib/drive";

export const revalidate = 60;

export default async function Photos() {
  const { data: photos } = await supabase
    .from("media")
    .select("*")
    .eq("type", "photo")
    .order("filmed_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">
        Photos
      </h1>
      <p className="text-taru-brown italic text-lg mb-12">
        A gallery of every stop along the way
      </p>

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(photos as MediaItem[]).map((photo) => (
            <a
              key={photo.id}
              href={photo.r2_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-taru-cream"
            >
              <img
                src={photo.thumbnail_url || driveThumbnailUrl(photo.r2_url)}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold">{photo.title}</p>
                  {photo.location && (
                    <p className="text-white/80 text-xs">{photo.location}</p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
