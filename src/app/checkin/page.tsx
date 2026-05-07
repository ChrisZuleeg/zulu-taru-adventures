"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faLocationDot, faSpinner } from "@fortawesome/free-solid-svg-icons";

type Stop = {
  id: number;
  order_num: number;
  name: string;
  state: string;
  visited: boolean;
  visited_at: string | null;
};

type AddStage = "idle" | "locating" | "geocoding" | "confirm" | "submitting" | "success";

export default function Checkin() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  // Add stop state
  const [addStage, setAddStage] = useState<AddStage>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetch("/api/checkin/stops")
      .then((r) => r.json())
      .then((data) => { setStops(data); setLoading(false); });
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

  async function addCurrentLocation() {
    setAddError("");
    setAddStage("locating");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setAddStage("geocoding");

        // Reverse geocode using Google Maps API from the browser
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();
          if (data.results?.[0]) {
            const components = data.results[0].address_components;
            const locality = components.find((c: any) =>
              c.types.includes("locality") || c.types.includes("sublocality")
            )?.long_name || "";
            const stateComp = components.find((c: any) =>
              c.types.includes("administrative_area_level_1")
            )?.short_name || "";
            setName(locality);
            setState(stateComp);
          }
        } catch {
          // Geocoding failed — user can type manually
        }

        setAddStage("confirm");
      },
      (err) => {
        setAddError(err.code === 1 ? "Location access denied. Enable it in your iPhone settings." : "Couldn't get your location. Try again.");
        setAddStage("idle");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async function submitStop() {
    if (!name.trim()) { setAddError("Please enter a name for this stop."); return; }
    setAddError("");
    setAddStage("submitting");

    const res = await fetch("/api/stops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, name, state, lat: coords!.lat, lng: coords!.lng }),
    });
    const data = await res.json();

    if (!res.ok) {
      setAddError(res.status === 401 ? "Wrong password." : data.error || "Something went wrong.");
      setAddStage("confirm");
      return;
    }

    setStops((prev) => [...prev, data]);
    setAddStage("success");
    setTimeout(() => {
      setAddStage("idle");
      setName(""); setState(""); setCoords(null); setPassword(""); setAddError("");
    }, 2000);
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
      <h1 className="font-heading text-4xl font-bold text-taru-green mb-2">Check In</h1>
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
            {stop.visited && <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />}
          </button>
        ))}
      </div>

      {/* Add current location */}
      <div className="mt-10">
        {addStage === "idle" && (
          <>
            <button
              onClick={addCurrentLocation}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-taru-green/40 text-taru-green font-semibold py-4 rounded-2xl hover:border-taru-green hover:bg-taru-green/5 transition-all"
            >
              <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
              Add where I am now
            </button>
            {addError && <p className="text-red-500 text-sm text-center mt-2">{addError}</p>}
          </>
        )}

        {(addStage === "locating" || addStage === "geocoding") && (
          <div className="text-center py-6 text-taru-green">
            <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin mb-2" />
            <p className="text-sm">{addStage === "locating" ? "Getting your location…" : "Looking up the place name…"}</p>
          </div>
        )}

        {(addStage === "confirm" || addStage === "submitting") && coords && (
          <div className="bg-white rounded-2xl border border-taru-cream p-5 space-y-4">
            <p className="font-semibold text-taru-green">Add this stop to your route</p>
            <p className="text-xs text-gray-400">
              📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
            <div>
              <label className="block text-xs font-semibold text-taru-green mb-1">Place name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zion National Park"
                className="w-full border border-taru-cream rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-taru-green mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-taru-cream rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
              />
            </div>
            {addError && <p className="text-red-500 text-sm">{addError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setAddStage("idle"); setAddError(""); }}
                className="flex-1 border border-taru-cream text-gray-500 text-sm font-semibold py-2.5 rounded-full hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitStop}
                disabled={addStage === "submitting"}
                className="flex-1 bg-taru-green text-taru-cream text-sm font-semibold py-2.5 rounded-full hover:bg-taru-green-dark transition-colors disabled:opacity-50"
              >
                {addStage === "submitting" ? "Adding…" : "Add to Route"}
              </button>
            </div>
          </div>
        )}

        {addStage === "success" && (
          <div className="text-center py-6">
            <p className="text-taru-green font-semibold">Stop added to your route!</p>
          </div>
        )}
      </div>
    </div>
  );
}
