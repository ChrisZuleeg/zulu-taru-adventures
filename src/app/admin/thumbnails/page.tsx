"use client";

import { useState, useRef } from "react";

type Status = "idle" | "running" | "done" | "error";

export default function ThumbnailAdmin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [width, setWidth] = useState(400);
  const stopRef = useRef(false);

  async function checkAuth() {
    setAuthError("");
    const res = await fetch(`/api/admin/thumbnails?password=${encodeURIComponent(password)}`);
    if (res.status === 401) { setAuthError("Wrong password."); return; }
    const data = await res.json();
    setTotal(data.total);
    setDone(data.done);
    setAuthed(true);
  }

  function addLog(msg: string) {
    setLog((prev) => [msg, ...prev].slice(0, 100));
  }

  async function start() {
    stopRef.current = false;
    setStatus("running");
    setLog([]);

    let iterations = 0;
    const MAX = 2000; // safety cap

    while (!stopRef.current && iterations < MAX) {
      iterations++;
      try {
        const res = await fetch("/api/admin/thumbnails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, width }),
        });
        const data = await res.json();

        if (!res.ok) {
          addLog(`⚠️ Error on ${data.photo_id || "unknown"}: ${data.error}`);
          // Don't stop on individual errors — keep going
          continue;
        }

        setDone(data.done);
        setTotal(data.total);

        if (data.finished) {
          addLog(`✅ All done! ${data.done} photos processed.`);
          setStatus("done");
          return;
        }

        if (data.skipped) {
          addLog(`⏭ Skipped (couldn't fetch): ${data.skipped}`);
        } else if (data.processed) {
          addLog(`✓ ${data.processed} — ${data.size_kb}KB`);
        }

      } catch (e) {
        addLog(`⚠️ Network error: ${e instanceof Error ? e.message : String(e)}`);
      }

      // Small pause between requests to be a good citizen
      await new Promise((r) => setTimeout(r, 300));
    }

    if (iterations >= MAX) {
      addLog("⚠️ Hit safety cap — refresh and restart to continue.");
    }
    setStatus("idle");
  }

  function stop() {
    stopRef.current = true;
    setStatus("idle");
    addLog("⏸ Paused.");
  }

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-6 py-24">
        <h1 className="font-heading text-3xl font-bold text-taru-green mb-6">Thumbnail Generator</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && checkAuth()}
          placeholder="Password"
          autoFocus
          className="w-full border border-taru-cream rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand mb-3"
        />
        {authError && <p className="text-red-500 text-xs mb-3">{authError}</p>}
        <button onClick={checkAuth} className="w-full bg-taru-green text-taru-cream font-semibold py-2.5 rounded-full hover:bg-taru-green-dark transition-colors">
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-heading text-3xl font-bold text-taru-green mb-2">Thumbnail Generator</h1>
      <p className="text-gray-500 text-sm mb-8">
        Generates fast Supabase-hosted thumbnails for all photos. Processes one at a time — you can pause and resume anytime.
      </p>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-taru-cream p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-taru-green">{done} / {total} photos</span>
          <span className="text-sm text-gray-400">{pct}%</span>
        </div>
        <div className="w-full bg-taru-cream rounded-full h-3 overflow-hidden">
          <div
            className="bg-taru-green h-3 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        {status === "done" && (
          <p className="text-taru-green font-semibold text-sm mt-3 text-center">All thumbnails generated!</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Thumbnail width (px)</label>
          <select
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            disabled={status === "running"}
            className="border border-taru-cream rounded-lg px-3 py-2 text-sm text-gray-700 bg-taru-sand focus:outline-none"
          >
            <option value={300}>300px (~15KB)</option>
            <option value={400}>400px (~25KB)</option>
            <option value={600}>600px (~45KB)</option>
            <option value={800}>800px (~70KB)</option>
          </select>
        </div>

        {status === "running" ? (
          <button
            onClick={stop}
            className="mt-5 bg-red-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-red-600 transition-colors"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={start}
            disabled={status === "done"}
            className="mt-5 bg-taru-green text-taru-cream font-semibold px-6 py-2.5 rounded-full hover:bg-taru-green-dark transition-colors disabled:opacity-40"
          >
            {done > 0 && done < total ? "Resume" : "Start"}
          </button>
        )}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-300 max-h-64 overflow-y-auto space-y-1">
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      <div className="mt-8 p-4 bg-taru-cream/50 rounded-xl text-xs text-gray-500 space-y-1">
        <p>⚡ Thumbnails are stored in Supabase Storage and served via CDN — much faster than Google Drive.</p>
        <p>📦 Estimated storage: ~{Math.round(total * 25 / 1024)}MB for {total} photos at 400px (well within the free 1GB).</p>
        <p>⏸ Safe to pause and resume anytime — already-processed photos are skipped automatically.</p>
      </div>
    </div>
  );
}
