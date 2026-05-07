import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import RouteMap from "./RouteMap";

export const revalidate = 60;

export default async function Route() {
  const { data: stops } = supabase
    ? await supabase.from("stops").select("*").order("order_num")
    : { data: [] };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">
        The Route
      </h1>
      <p className="text-taru-brown italic text-lg mb-10">
        ~4,000 miles across California, Nevada, Utah, New Mexico, and Colorado
      </p>
      {!hasSupabaseEnv && (
        <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          Supabase is not configured in this environment yet, so route progress
          cannot be loaded.
        </div>
      )}

      <RouteMap stops={stops || []} />

      <div className="mt-12 space-y-3">
        {(stops || []).map((stop) => (
          <div key={stop.id} className="flex gap-4 items-start">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                ${stop.visited ? "bg-taru-green text-taru-cream" : "bg-taru-cream text-taru-green border-2 border-taru-green/30"}`}>
                {stop.visited ? <FontAwesomeIcon icon={faCheck} className="h-3 w-3" /> : stop.order_num}
              </div>
              {stop.order_num < (stops?.length ?? 0) && (
                <div className={`w-0.5 h-8 mt-1 ${stop.visited ? "bg-taru-green" : "bg-taru-green/20"}`} />
              )}
            </div>
            <div className="pb-4">
              <p className={`font-semibold ${stop.visited ? "text-taru-green" : "text-gray-500"}`}>
                {stop.name}
                <span className="text-xs font-normal ml-2">{stop.state}</span>
              </p>
              {stop.visited_at && (
                <p className="text-xs text-taru-brown mt-0.5">
                  Visited {new Date(stop.visited_at).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-taru-cream rounded-xl p-6 text-center">
        <p className="text-gray-600 text-sm">
          Duration: approximately 4–5 weeks &bull; Summer 2026
        </p>
      </div>
    </div>
  );
}
