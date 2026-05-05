export default function Videos() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">GoPro Videos</h1>
      <p className="text-taru-brown italic text-lg mb-12">
        Raw footage from the highway, trails, and hot springs
      </p>

      <div className="bg-taru-cream rounded-2xl p-10 text-center">
        <p className="font-heading text-2xl text-taru-green font-bold mb-3">
          Videos are on their way.
        </p>
        <p className="text-gray-600 leading-relaxed">
          GoPro footage from the road will automatically appear here once the trip
          begins. The pipeline is: GoPro &rarr; iPhone &rarr; Google Drive &rarr;
          this page.
        </p>
      </div>
    </div>
  );
}
