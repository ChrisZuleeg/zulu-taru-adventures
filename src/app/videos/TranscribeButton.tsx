"use client";

import { useState } from "react";

export default function TranscribeButton({ id }: { id: string }) {
  const [stage, setStage] = useState<"idle" | "password" | "working" | "done" | "error">("idle");
  const [password, setPassword] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  async function start() {
    setStage("working");
    setError("");
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      let data: Record<string, string> = {};
      try { data = await res.json(); } catch {
        setError(`Server error ${res.status}.`);
        setStage("password");
        return;
      }
      if (!res.ok) {
        setError(res.status === 401 ? "Wrong password." : data.error || `Error ${res.status}`);
        setStage("password");
        return;
      }
      poll(data.job_id);
    } catch (e) {
      setError(`Network error: ${e instanceof Error ? e.message : String(e)}`);
      setStage("password");
    }
  }

  async function poll(job_id: string) {
    try {
      const res = await fetch(`/api/transcribe?job_id=${job_id}&media_id=${id}`);
      let data: Record<string, string> = {};
      try { data = await res.json(); } catch {
        setError(`Poll error ${res.status} — check Vercel logs.`);
        setStage("password");
        return;
      }
      if (!res.ok) {
        setError(data.error || `Error ${res.status}`);
        setStage("password");
        return;
      }
      if (data.status === "completed") {
        setSummary(data.summary);
        setStage("done");
        return;
      }
      setTimeout(() => poll(job_id), 5000);
    } catch (e) {
      setError(`Lost connection: ${e instanceof Error ? e.message : String(e)}`);
      setStage("password");
    }
  }

  if (stage === "idle") {
    return (
      <button
        onClick={() => setStage("password")}
        className="text-xs text-taru-green/60 hover:text-taru-green transition-colors mt-1"
      >
        ✦ Transcribe
      </button>
    );
  }

  if (stage === "password") {
    return (
      <div className="mt-2 flex gap-2 flex-wrap">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && start()}
          placeholder="Password"
          autoFocus
          className="flex-1 border border-taru-cream rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
        />
        <button
          onClick={start}
          className="bg-taru-green text-taru-cream text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-taru-green-dark transition-colors"
        >
          Go
        </button>
        {error && <p className="w-full text-red-500 text-xs">{error}</p>}
      </div>
    );
  }

  if (stage === "working") {
    return <p className="text-xs text-gray-400 mt-1 animate-pulse">Transcribing… checking every 5 seconds.</p>;
  }

  if (stage === "done") {
    return <p className="text-sm text-gray-600 mt-2 leading-relaxed italic">{summary}</p>;
  }

  return null;
}
