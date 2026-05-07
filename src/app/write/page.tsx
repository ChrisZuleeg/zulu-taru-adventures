"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "journal" | "note";
type Stage = "locked" | "write" | "cleanup" | "publishing" | "done";

export default function Write() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("locked");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [mode, setMode] = useState<Mode>("journal");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [cleaned, setCleaned] = useState("");
  const [cleanupError, setCleanupError] = useState("");

  function unlock() {
    if (!password.trim()) return;
    setPasswordError("");
    // Password is verified server-side on publish; optimistically unlock
    setStage("write");
  }

  async function runCleanup() {
    setCleanupError("");
    setStage("cleanup");
    const res = await fetch("/api/ai-cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, type: mode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCleanupError(data.error || "AI cleanup failed.");
      setStage("write");
      return;
    }
    setCleaned(data.cleaned);
  }

  function acceptCleanup() {
    setBody(cleaned);
    setCleaned("");
    setStage("write");
  }

  function rejectCleanup() {
    setCleaned("");
    setStage("write");
  }

  async function publish() {
    setStage("publishing");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, type: mode, title, body, location }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        setPasswordError("Wrong password — go back and try again.");
        setStage("locked");
        return;
      }
      setStage("write");
      return;
    }
    setStage("done");
    setTimeout(() => router.push(`/journal/${data.id}`), 1200);
  }

  if (stage === "done") {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <p className="font-heading text-3xl text-taru-green font-bold mb-2">Posted!</p>
        <p className="text-gray-500 text-sm">Taking you there now…</p>
      </div>
    );
  }

  if (stage === "locked") {
    return (
      <div className="max-w-sm mx-auto px-6 py-24">
        <h1 className="font-heading text-3xl font-bold text-taru-green mb-8 text-center">Write</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && unlock()}
          placeholder="Password"
          className="w-full border border-taru-cream rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand mb-3 text-center text-lg tracking-widest"
          autoFocus
        />
        {passwordError && <p className="text-red-500 text-sm text-center mb-3">{passwordError}</p>}
        <button
          onClick={unlock}
          className="w-full bg-taru-green text-taru-cream font-semibold py-3 rounded-full hover:bg-taru-green-dark transition-colors"
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-bold text-taru-green mb-6">Write</h1>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("journal")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${mode === "journal" ? "bg-taru-green text-taru-cream" : "bg-taru-cream text-taru-green hover:bg-taru-green/10"}`}
        >
          Journal Entry
        </button>
        <button
          onClick={() => setMode("note")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${mode === "note" ? "bg-taru-green text-taru-cream" : "bg-taru-cream text-taru-green hover:bg-taru-green/10"}`}
        >
          Live Note
        </button>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border border-taru-cream rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand font-heading text-lg"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
          className="w-full border border-taru-cream rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={mode === "note" ? "What's happening right now…" : "Start speaking or typing…"}
          rows={mode === "note" ? 4 : 12}
          className="w-full border border-taru-cream rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand resize-none leading-relaxed"
        />

        {cleanupError && <p className="text-red-500 text-sm">{cleanupError}</p>}

        {/* AI cleanup preview */}
        {stage === "cleanup" && !cleaned && (
          <div className="bg-taru-cream rounded-xl p-4 text-center text-sm text-gray-500 animate-pulse">
            Cleaning up with AI…
          </div>
        )}

        {cleaned && (
          <div className="border-2 border-taru-green/30 rounded-xl p-5 bg-white">
            <p className="text-xs font-semibold text-taru-green mb-3">AI suggestion — review before accepting</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Original</p>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{body}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Cleaned up</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{cleaned}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={acceptCleanup}
                className="flex-1 bg-taru-green text-taru-cream text-sm font-semibold py-2 rounded-full hover:bg-taru-green-dark transition-colors"
              >
                Use cleaned version
              </button>
              <button
                onClick={rejectCleanup}
                className="flex-1 bg-taru-cream text-taru-green text-sm font-semibold py-2 rounded-full hover:bg-taru-green/10 transition-colors"
              >
                Keep original
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {stage === "write" && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={runCleanup}
              disabled={!body.trim()}
              className="flex-1 border-2 border-taru-green text-taru-green text-sm font-semibold py-3 rounded-full hover:bg-taru-green/10 transition-colors disabled:opacity-40"
            >
              Clean up with AI ✨
            </button>
            <button
              onClick={publish}
              disabled={!body.trim()}
              className="flex-1 bg-taru-green text-taru-cream text-sm font-semibold py-3 rounded-full hover:bg-taru-green-dark transition-colors disabled:opacity-40"
            >
              Publish
            </button>
          </div>
        )}

        {stage === "publishing" && (
          <div className="text-center py-4 text-sm text-gray-500 animate-pulse">Publishing…</div>
        )}
      </div>
    </div>
  );
}
