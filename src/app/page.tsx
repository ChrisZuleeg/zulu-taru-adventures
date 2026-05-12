import Image from "next/image";

export default function Home() {
  const stops = [
    { name: "Campbell", state: "CA", desc: "Home base" },
    { name: "Avila Hot Springs", state: "CA", desc: "First soak" },
    { name: "Tecopa", state: "CA", desc: "Mojave Desert" },
    { name: "Las Vegas", state: "NV", desc: "Friends & lights" },
    { name: "Zion NP", state: "UT", desc: "Red rock canyons" },
    { name: "Santa Fe", state: "NM", desc: "Furthest east" },
    { name: "Boulder", state: "CO", desc: "Mountain air" },
    { name: "Moab", state: "UT", desc: "Arches & red rock" },
    { name: "Great Basin", state: "NV", desc: "Remote wilderness" },
    { name: "Campbell", state: "CA", desc: "Home again" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        <Image
          src="/taru-hero.jpg"
          alt="Taru, a 1976 VW Westfalia"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="relative z-10 px-8 md:px-16 pb-16 md:pb-20 max-w-2xl">
          <p className="text-taru-cream/70 text-xs uppercase tracking-[0.25em] mb-4 font-sans">
            Summer 2026 &bull; American Southwest
          </p>
          <h1
            className="font-heading text-5xl md:text-6xl font-bold text-white mb-5 leading-tight"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
          >
            Zulu and Taru&apos;s
            <br />
            Adventures
          </h1>
          <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-lg">
            One newly retired human. One beloved 1976 VW Westfalia. Four weeks
            across the American Southwest.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/journal"
              className="bg-taru-cream text-taru-green-dark font-semibold px-7 py-3 rounded-full hover:bg-white transition-colors shadow-lg text-sm"
            >
              Follow Our Journey
            </a>
            <a
              href="/route"
              className="border-2 border-taru-cream/70 text-taru-cream font-semibold px-7 py-3 rounded-full hover:bg-white/10 hover:border-white transition-colors text-sm"
            >
              View the Route
            </a>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center">
          <div className="text-center lg:text-left">
            <h2 className="font-heading text-4xl font-bold text-taru-green mb-6">
              The Trip of a Lifetime
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              After 11 years of adventures together, Zulu and Taru are hitting the
              open road for their biggest journey yet. Fresh out of retirement and
              with a newly rebuilt engine, Taru is ready for the American Southwest.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Follow along for GoPro footage from the road, journal entries from
              the campfire, photos from every stop, and the occasional hot spring
              soak.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Image
              src="/taru-trip-van.png"
              alt="Side profile illustration of Taru, the 1976 VW Westfalia camper van"
              width={1024}
              height={768}
              sizes="(max-width: 1024px) 100vw, 480px"
              className="w-full max-w-md lg:max-w-lg h-auto object-contain drop-shadow-[0_12px_40px_rgba(58,68,23,0.18)]"
            />
          </div>
        </div>
      </section>

      {/* Route strip */}
      <section className="bg-taru-green py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-bold text-taru-cream text-center mb-1">
            The Route
          </h2>
          <p className="text-taru-cream/50 text-center text-sm mb-12 italic">
            ~4,000 miles across five states
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {stops.map((stop, i) => (
              <div key={i} className="text-center">
                <div className="w-9 h-9 rounded-full bg-taru-cream text-taru-green text-sm font-bold flex items-center justify-center mx-auto mb-2 shadow-sm">
                  {i + 1}
                </div>
                <p className="font-semibold text-taru-cream text-sm leading-snug">
                  {stop.name}
                </p>
                <p className="text-taru-cream/45 text-xs mt-0.5">
                  {stop.state} &middot; {stop.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="/route"
              className="inline-block bg-taru-cream text-taru-green font-semibold px-6 py-2.5 rounded-full hover:bg-white transition-colors text-sm shadow"
            >
              View interactive map &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Explore */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-heading text-3xl font-bold text-taru-green text-center mb-12">
          Explore the Journey
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            {
              href: "/journal",
              title: "Journal",
              desc: "Daily writing from the road — campfire thoughts, desert sunsets, and everything in between.",
            },
            {
              href: "/videos",
              title: "GoPro Videos",
              desc: "Raw footage from the highway, trails, and hot springs. The Southwest from Taru's perspective.",
            },
            {
              href: "/photos",
              title: "Photos",
              desc: "A gallery of every stop — landscapes, sunsets, small towns, and Taru in her element.",
            },
            {
              href: "/tarus-story",
              title: "Taru's Story",
              desc: "How Zulu found a 1976 Westfalia on April Fools Day 2014, and 11 years of adventures since.",
            },
            {
              href: "/route",
              title: "The Route",
              desc: "Interactive map of the full journey — every stop, campsite, and detour.",
            },
            {
              href: "/contact",
              title: "Say Hello",
              desc: "Drop Zulu a note from wherever you are. He reads everything, eventually.",
            },
          ].map(({ href, title, desc }) => (
            <a
              key={href}
              href={href}
              className="bg-white rounded-2xl p-7 border border-taru-cream/60 hover:border-taru-green/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-heading text-xl font-bold text-taru-green mb-2 group-hover:text-taru-green-dark transition-colors">
                {title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
