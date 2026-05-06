"use client";

import { useForm, ValidationError } from "@formspree/react";

export default function Contact() {
  const [state, handleSubmit] = useForm("xvzlqrwe");

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">Say Hello</h1>
      <p className="text-taru-brown italic text-lg mb-12">
        Zulu reads everything, eventually
      </p>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-taru-cream">
        {state.succeeded ? (
          <div className="text-center py-8">
            <p className="font-heading text-2xl text-taru-green mb-2">Message sent!</p>
            <p className="text-gray-500 text-sm">Zulu will get back to you from the road.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you&apos;re a fellow van lifer, a Southwest traveler with tips, or just
              someone who loves a good VW Westfalia — drop Zulu a note.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-taru-green mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  name="name"
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
                  name="email"
                  required
                  className="w-full border border-taru-cream rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
                  placeholder="your@email.com"
                />
                <ValidationError field="email" prefix="Email" errors={state.errors} className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-taru-green mb-1.5">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full border border-taru-cream rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand resize-none"
                  placeholder="Say anything..."
                />
                <ValidationError field="message" prefix="Message" errors={state.errors} className="text-red-500 text-xs mt-1" />
              </div>
              <button
                type="submit"
                disabled={state.submitting}
                className="w-full bg-taru-green text-taru-cream font-semibold py-3 rounded-full hover:bg-taru-green-dark transition-colors disabled:opacity-50"
              >
                {state.submitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
