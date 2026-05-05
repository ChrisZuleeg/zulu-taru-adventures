import Image from "next/image";

export default function Home() {
  const stops = [
    { name: "Campbell, CA", desc: "Home base — the journey begins" },
    { name: "Avila Hot Springs, CA", desc: "First soak of the trip" },
    { name: "Tecopa Hot Springs, CA", desc: "Deep in the Mojave Desert" },
    { name: "Las Vegas, NV", desc: "Friends, lights, and desert heat" },
    { name: "Zion NP, UT", desc: "Red rock canyon country" },
    { name: "Santa Fe, NM", desc: "Furthest east — adobe and art" },
    { name: "Boulder, CO", desc: "Mountain air and good vibes" },
    { name: "Moab, UT", desc: "Arches and endless red rock" },
    { name: "Great Basin, NV", desc: "Remote Nevada wilderness" },
    { name: "Campbell, CA", desc: "Home — stories to tell forever" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-taru-green min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-taru-green-dark/40 to-taru-green/80" />

        <Image
          src="/taru-hero.jpg"
          alt="Taru, a 1976 VW Westfalia"
          fill
          className="object-cover"
          priority
        />

        <div className="relative z-10 text-center px-6 py-16 max-w-3xl mx-auto">
          <p className="text-taru-cream/80 text-sm uppercase tracking-widest mb-4 font-sans">
            Summer 2026 &bull; American Southwest
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-taru-cream mb-6 leading-tight">
            Zulu and Taru&apos;s
            <br />
            Adventures
          </h1>
          <p className="text-taru-cream/90 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            One newly retired human. One beloved 1976 VW Westfalia. Four weeks
            across California, Nevada, Utah, New Mexico, and Colorado.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/journal"
              className="bg-taru-cream text-taru-green font-semibold px-8 py-3 rounded-full hover:bg-white transition-colors shadow-lg"
            >
              Follow Our Journey
            </a>
            <a
              href="/route"
              className="border-2 border-taru-cream text-taru-cream font-semibold px-8 py-3 rounded-full hover:bg-taru-cream hover:text-taru-green transition-colors"
            >
              View the Route
            </a>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="font-heading text-4xl font-bold text-taru-green mb-6">
          The Trip of a Lifetime
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          After 11 years of adventures together, Zulu and Taru are hitting the open
          road for their biggest journey yet. Fresh out of retirement and with a
          newly rebuilt engine, Taru is ready for the American Southwest.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Follow along for GoPro footage from the road, journal entries from the
          campfire, photos from every stop, and the occasional hot spring soak.
        </p>
      </section>

      {/* Route Strip */}
      <section className="bg-taru-cream py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-bold text-taru-green text-center mb-10">
            The Route
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stops.map((stop, i) => (
              <div key={i} className="text-center">
                <div className="w-8 h-8 rounded-full bg-taru-green text-taru-cream text-sm font-bold flex items-center justify-center mx-auto mb-2">
                  {i + 1}
                </div>
                <p className="font-semibold text-taru-green text-sm">{stop.name}</p>
                <p className="text-gray-600 text-xs mt-1">{stop.desc}</p>
                {i < stops.length - 1 && (
                  <div className="hidden lg:block text-taru-green-light text-2xl mt-1">
                    &rarr;
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="/route"
              className="text-taru-green font-semibold hover:text-taru-green-dark underline underline-offset-4"
            >
              View interactive map &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-heading text-3xl font-bold text-taru-green text-center mb-10">
          Explore the Journey
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { href: "/journal", title: "Journal", desc: "Daily writing from the road — campfire thoughts, desert sunsets, and everything in between." },
            { href: "/videos", title: "GoPro Videos", desc: "Raw footage from the highway, trails, and hot springs. Taru's perspective on the Southwest." },
            { href: "/photos", title: "Photos", desc: "A gallery of every stop — landscapes, sunsets, small towns, and Taru in her element." },
            { href: "/tarus-story", title: "Taru's Story", desc: "How Zulu found a 1976 Westfalia on April Fools Day 2014, and 11 years of adventures since." },
            { href: "/route", title: "The Route", desc: "Interactive map of the full journey — every stop, campsite, and detour." },
            { href: "/contact", title: "Say Hello", desc: "Drop Zulu a note from wherever you are. He reads everything, eventually." },
          ].map(({ href, title, desc }) => (
            <a
              key={href}
              href={href}
              className="bg-white rounded-xl p-6 shadow-sm border border-taru-cream hover:border-taru-green hover:shadow-md transition-all group"
            >
              <h3 className="font-heading text-xl font-bold text-taru-green mb-2 group-hover:text-taru-green-dark">
                {title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
