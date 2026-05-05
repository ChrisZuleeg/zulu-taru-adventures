const stops = [
  { num: 1, name: "Campbell, CA", desc: "Home base — where it all begins", type: "home" },
  { num: 2, name: "Avila Hot Springs, CA", desc: "Pacific Coast hot springs — first soak of the trip", type: "stop" },
  { num: 3, name: "Tecopa Hot Springs, CA", desc: "Remote natural hot springs deep in the Mojave Desert", type: "stop" },
  { num: 4, name: "Las Vegas, NV", desc: "City stop — visiting friends, bright lights, desert heat", type: "stop" },
  { num: 5, name: "Zion NP, UT", desc: "Red rock canyon country — one of America's most dramatic parks", type: "stop" },
  { num: 6, name: "Santa Fe, NM", desc: "Furthest east point — adobe architecture, art, green chile", type: "stop" },
  { num: 7, name: "Boulder, CO", desc: "Mountain air, Flatirons, and good vibes", type: "stop" },
  { num: 8, name: "Moab, UT", desc: "Arches and Canyonlands — the red rock capitol of the world", type: "stop" },
  { num: 9, name: "Great Basin, NV", desc: "Remote Nevada wilderness — ancient bristlecone pines", type: "stop" },
  { num: 10, name: "Campbell, CA", desc: "Home — with a lifetime of stories", type: "home" },
];

export default function Route() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">The Route</h1>
      <p className="text-taru-brown italic text-lg mb-12">
        ~4,000 miles across California, Nevada, Utah, New Mexico, and Colorado
      </p>

      {/* Map placeholder */}
      <div className="bg-taru-cream rounded-2xl p-8 mb-12 text-center border-2 border-dashed border-taru-cream-dark">
        <p className="font-heading text-xl text-taru-green font-bold mb-2">Interactive Map</p>
        <p className="text-gray-500 text-sm">
          An embedded map will go here — Google Maps or Mapbox showing the full route.
        </p>
      </div>

      {/* Stop list */}
      <div className="space-y-4">
        {stops.map((stop, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                  ${stop.type === "home" ? "bg-taru-brown text-white" : "bg-taru-green text-taru-cream"}`}
              >
                {stop.num}
              </div>
              {i < stops.length - 1 && (
                <div className="w-0.5 h-8 bg-taru-green/30 mt-1" />
              )}
            </div>
            <div className="pb-4">
              <p className="font-semibold text-taru-green">{stop.name}</p>
              <p className="text-gray-600 text-sm mt-0.5">{stop.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-taru-cream rounded-xl p-6 text-center">
        <p className="text-gray-600 text-sm">
          Duration: approximately 4&ndash;5 weeks &bull; Summer 2026 &bull; Taru&apos;s first big summer trip since retirement
        </p>
      </div>
    </div>
  );
}
