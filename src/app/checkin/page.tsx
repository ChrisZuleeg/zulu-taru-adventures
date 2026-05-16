"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck, faLocationDot, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";

type Stop = {
  id: number;
  order_num: number;
  name: string;
  state: string;
  visited: boolean;
  visited_at: string | null;
  photo_url: string | null;
};

type AddStage = "idle" | "locating" | "geocoding" | "confirm" | "submitting" | "success";

function resizeImage(file: File, maxPx = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = URL.createObjectURL(file);
  });
}

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
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();
          if (data.results?.[0]) {
            const components = data.results[0].address_components;
            const locality = components.find((c: { types: string[]; long_name: string }) =>
              c.types.includes("locality") || c.types.includes("sublocality")
            )?.long_name || "";
            const stateComp = components.find((c: { types: string[]; short_name: string }) =>
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

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImage(file);
    setPhoto(resized);
  }

  async function submitStop() {
    if (!name.trim()) { setAddError("Please enter a name for this stop."); return; }
    setAddError("");
    setAddStage("submitting");

    const res = await fetch("/api/stops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, name, state, lat: coords!.lat, lng: coords!.lng, photo }),
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
      setName(""); setState(""); setCoords(null); setPassword(""); setAddError(""); setPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
            {stop.photo_url && (
              <img
                src={stop.photo_url}
                alt={stop.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
            )}
            {!stop.photo_url && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                ${stop.visited ? "bg-white text-taru-green" : "bg-taru-cream text-taru-green"}`}>
                {stop.order_num}
              </div>
            )}
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

            {/* Photo capture */}
            <div>
              <label className="block text-xs font-semibold text-taru-green mb-1">Photo (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {photo ? (
                <div className="relative inline-block">
                  <img src={photo} alt="Stop photo" className="w-24 h-24 rounded-xl object-cover" />
                  <button
                    onClick={() => { setPhoto(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-2.5 w-2.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 border border-taru-cream rounded-lg px-4 py-2 text-sm text-taru-green font-semibold hover:border-taru-green hover:bg-taru-green/5 transition-all"
                >
                  <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
                  Take a photo
                </button>
              )}
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
                onClick={() => { setAddStage("idle"); setAddError(""); setPhoto(null); }}
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
