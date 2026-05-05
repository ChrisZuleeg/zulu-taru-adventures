export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">Say Hello</h1>
      <p className="text-taru-brown italic text-lg mb-12">
        Zulu reads everything, eventually
      </p>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-taru-cream">
        <p className="text-gray-600 mb-8 leading-relaxed">
          Whether you&apos;re a fellow van lifer, a Southwest traveler with tips, or just
          someone who loves a good VW Westfalia — drop Zulu a note.
        </p>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-taru-green mb-1.5">
              Your name
            </label>
            <input
              type="text"
              className="w-full border border-taru-cream rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
              placeholder="What do we call you?"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-taru-green mb-1.5">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-taru-cream rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-taru-green mb-1.5">
              Message
            </label>
            <textarea
              rows={5}
              className="w-full border border-taru-cream rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand resize-none"
              placeholder="Say anything..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-taru-green text-taru-cream font-semibold py-3 rounded-full hover:bg-taru-green-dark transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
