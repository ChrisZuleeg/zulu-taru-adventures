"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setFormState("submitting");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setFormState("success");
    } else {
      const { error } = await res.json();
      setErrorMsg(error || "Something went wrong. Please try again.");
      setFormState("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">Say Hello</h1>
      <p className="text-taru-brown italic text-lg mb-12">
        Zulu reads everything, eventually
      </p>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-taru-cream">
        {formState === "success" ? (
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
              </div>

              {formState === "error" && (
                <p className="text-red-500 text-sm">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={formState === "submitting"}
                className="w-full bg-taru-green text-taru-cream font-semibold py-3 rounded-full hover:bg-taru-green-dark transition-colors disabled:opacity-50"
              >
                {formState === "submitting" ? "Sending…" : "Send Message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
