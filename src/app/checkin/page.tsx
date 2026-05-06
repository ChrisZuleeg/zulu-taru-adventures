"use client";

import { useEffect, useState } from "react";

type Stop = {
  id: number;
  order_num: number;
  name: string;
  state: string;
  visited: boolean;
  visited_at: string | null;
};

export default function Checkin() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/checkin/stops")
      .then((r) => r.json())
      .then((data) => {
        setStops(data);
        setLoading(false);
      });
  }, []);

  async function toggle(stop: Stop) {
    setUpdating(stop.id);
    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: stop.id, visited: !stop.visited }),
    });
    setStops((prev) =>
      prev.map((s) =>
        s.id === stop.id
          ? { ...s, visited: !s.visited, visited_at: !s.visited ? new Date().toISOString() : null }
          : s
      )
    );
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <p className="text-gray-500">Loading stops...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-heading text-4xl font-bold text-taru-green mb-2">
        Check In
      </h1>
      <p className="text-taru-brown italic mb-10">
        Tap a stop when you arrive to mark it visited.
      </p>

      <div className="space-y-3">
        {stops.map((stop) => (
          <button
            key={stop.id}
            onClick={() => toggle(stop)}
            disabled={updating === stop.id}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
              ${stop.visited
                ? "bg-taru-green border-taru-green text-white"
                : "bg-white border-taru-cream hover:border-taru-green text-gray-700"
              } ${updating === stop.id ? "opacity-50" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
              ${stop.visited ? "bg-white text-taru-green" : "bg-taru-cream text-taru-green"}`}>
              {stop.order_num}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{stop.name}</p>
              <p className={`text-xs mt-0.5 ${stop.visited ? "text-white/70" : "text-gray-400"}`}>
                {stop.state}
                {stop.visited_at && ` · visited ${new Date(stop.visited_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              </p>
            </div>
            <span className="text-lg">{stop.visited ? "✓" : ""}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
