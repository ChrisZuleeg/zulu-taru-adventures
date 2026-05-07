import { supabase, hasSupabaseEnv, MediaItem } from "@/lib/supabase";
import { driveEmbedUrl } from "@/lib/drive";
import TranscribeButton from "./TranscribeButton";

export const revalidate = 60;

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

export default async function Videos() {
  let videos: MediaItem[] | null = null;

  if (supabase) {
    const { data } = await supabase
      .from("media")
      .select("*")
      .eq("type", "video")
      .order("filmed_at", { ascending: false });
    videos = (data as MediaItem[]) || [];
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">
        GoPro Videos
      </h1>
      <p className="text-taru-brown italic text-lg mb-12">
        Raw footage from the highway, trails, and hot springs
      </p>
      {!hasSupabaseEnv && (
        <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          Supabase is not configured in this environment yet, so videos cannot
          be loaded.
        </div>
      )}

      {!videos || videos.length === 0 ? (
        <div className="bg-taru-cream rounded-2xl p-10 text-center">
          <p className="font-heading text-2xl text-taru-green font-bold mb-3">
            Videos are on their way.
          </p>
          <p className="text-gray-600 leading-relaxed">
            GoPro footage will appear here automatically once the trip begins.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupByDate(videos).map(({ date, items }) => (
            <div key={date}>
              <h2 className="font-heading text-xl text-taru-green mb-5 pb-2 border-b border-taru-cream">
                {date}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {items.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-2xl overflow-hidden border border-taru-cream/60 shadow-sm"
                  >
                    <iframe
                      src={driveEmbedUrl(video.r2_url)}
                      className="w-full aspect-video"
                      allow="autoplay"
                      allowFullScreen
                    />
                    <div className="p-4">
                      <p className="font-heading font-bold text-taru-green">{video.title}</p>
                      {video.location && (
                        <p className="text-sm text-gray-500 mt-1">{video.location}</p>
                      )}
                      {video.summary ? (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed italic">{video.summary}</p>
                      ) : (
                        <TranscribeButton id={String(video.id)} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
