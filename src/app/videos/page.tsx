import { supabase, MediaItem } from "@/lib/supabase";

export const revalidate = 60;

export default async function Videos() {
  const { data: videos } = await supabase
    .from("media")
    .select("*")
    .eq("type", "video")
    .order("filmed_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">
        GoPro Videos
      </h1>
      <p className="text-taru-brown italic text-lg mb-12">
        Raw footage from the highway, trails, and hot springs
      </p>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(videos as MediaItem[]).map((video) => (
            <a
              key={video.id}
              href={video.r2_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl overflow-hidden border border-taru-cream/60 hover:shadow-md transition-all group"
            >
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video bg-taru-green/10 flex items-center justify-center">
                  <span className="text-taru-green/40 text-4xl">▶</span>
                </div>
              )}
              <div className="p-4">
                <p className="font-heading font-bold text-taru-green group-hover:text-taru-green-dark transition-colors">
                  {video.title}
                </p>
                {video.location && (
                  <p className="text-sm text-gray-500 mt-1">{video.location}</p>
                )}
                {video.filmed_at && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(video.filmed_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
