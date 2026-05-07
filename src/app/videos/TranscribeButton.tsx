"use client";

import { useState } from "react";

export default function TranscribeButton({ id }: { id: string }) {
  const [stage, setStage] = useState<"idle" | "password" | "working" | "done" | "error">("idle");
  const [password, setPassword] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  async function run() {
    setStage("working");
    setError("");
    const res = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(res.status === 401 ? "Wrong password." : data.error || "Something went wrong.");
      setStage("password");
      return;
    }
    setSummary(data.summary);
    setStage("done");
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
      <div className="mt-2 flex gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Password"
          autoFocus
          className="flex-1 border border-taru-cream rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
        />
        <button
          onClick={run}
          className="bg-taru-green text-taru-cream text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-taru-green-dark transition-colors"
        >
          Go
        </button>
        {error && <p className="text-red-500 text-xs self-center">{error}</p>}
      </div>
    );
  }

  if (stage === "working") {
    return <p className="text-xs text-gray-400 mt-1 animate-pulse">Transcribing… this may take a minute.</p>;
  }

  if (stage === "done") {
    return <p className="text-sm text-gray-600 mt-2 leading-relaxed italic">{summary}</p>;
  }

  return null;
}
