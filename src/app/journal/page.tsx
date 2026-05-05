export default function Journal() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">Journal</h1>
      <p className="text-taru-brown italic text-lg mb-12">
        Dispatches from the road
      </p>

      <div className="bg-taru-cream rounded-2xl p-10 text-center">
        <p className="font-heading text-2xl text-taru-green font-bold mb-3">
          The road trip hasn&apos;t started yet.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Journal entries will appear here once Zulu and Taru hit the highway.
          Check back soon — the adventure is coming.
        </p>
      </div>
    </div>
  );
}
