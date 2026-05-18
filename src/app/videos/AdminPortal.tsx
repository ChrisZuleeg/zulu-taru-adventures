"use client";

import { useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type Mode = "button" | "gate" | "funny" | "password" | "portal";

export default function AdminPortal({
  id,
  transcript,
  location,
}: {
  id: string;
  transcript: string | null;
  location: string | null;
}) {
  const [mode, setMode] = useState<Mode>("button");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function unlock() {
    setUnlocking(true);
    setPasswordError("");
    try {
      const res = await fetch("/api/admin/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, transcript, messages: [] }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setPasswordError("Wrong password.");
        setUnlocking(false);
        return;
      }
      if (!res.ok) {
        setPasswordError(data.error || "Something went wrong.");
        setUnlocking(false);
        return;
      }
      const seedUserMsg: Message = transcript?.trim()
        ? { role: "user", content: `Here's a transcript from one of my GoPro videos taken on this road trip. What's the most interesting story hidden in this audio? What moment or detail jumps out at you that we could develop into something beautiful?\n\nTranscript:\n${transcript}` }
        : { role: "user", content: "No transcript yet for this video. Just say hi and let me know to transcribe it first." };
      setMessages([seedUserMsg, { role: "assistant", content: data.reply }]);
      setMode("portal");
    } finally {
      setUnlocking(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || chatLoading) return;
    const userMsg: Message = { role: "user", content: input };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/admin/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, transcript, messages: next }),
      });
      const data = await res.json();
      if (res.ok) setMessages([...next, { role: "assistant", content: data.reply }]);
    } finally {
      setChatLoading(false);
    }
  }

  function copyTranscript() {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function close() {
    setMode("button");
    setPasswordError("");
  }

  // Visible messages in chat (hide the hidden seed user message)
  const visibleMessages = messages.filter(
    (m) => !(m.role === "user" && m.content.startsWith("Here's a transcript from one of my GoPro"))
      && !(m.role === "user" && m.content.startsWith("No transcript yet"))
  );

  if (mode === "button") {
    return (
      <button
        onClick={() => setMode("gate")}
        className="text-[11px] text-gray-300 hover:text-gray-400 transition-colors mt-2 block"
      >
        Admin
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

      {/* Gate — Yes / No */}
      {mode === "gate" && (
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
          <p className="font-heading text-2xl font-bold text-taru-green mb-2">Restricted Access</p>
          <p className="text-gray-400 text-sm mb-8">Do you have the access code?</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setMode("password")}
              className="bg-taru-green text-taru-cream font-semibold px-7 py-2.5 rounded-full hover:bg-taru-green-dark transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setMode("funny")}
              className="border-2 border-taru-cream text-gray-500 font-semibold px-7 py-2.5 rounded-full hover:border-gray-300 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Funny — for the curious ones */}
      {mode === "funny" && (
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
          <p className="text-5xl mb-4">😅</p>
          <p className="font-heading text-2xl font-bold text-taru-green mb-2">
            You Shouldn&apos;t Have Clicked That!
          </p>
          <p className="text-gray-400 text-sm mb-8">Nothing to see here. Move along, traveler.</p>
          <button
            onClick={close}
            className="bg-taru-green text-taru-cream font-semibold px-7 py-2.5 rounded-full hover:bg-taru-green-dark transition-colors"
          >
            Go Back
          </button>
        </div>
      )}

      {/* Password entry */}
      {mode === "password" && (
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl">
          <p className="font-heading text-2xl font-bold text-taru-green mb-1 text-center">Enter Access Code</p>
          <p className="text-gray-400 text-xs text-center mb-6">The portal awaits.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="••••••••"
            autoFocus
            className="w-full border border-taru-cream rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand mb-3"
          />
          {passwordError && <p className="text-red-500 text-xs mb-3 text-center">{passwordError}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => { setMode("gate"); setPasswordError(""); }}
              className="flex-1 border border-taru-cream text-gray-500 text-sm font-semibold py-2.5 rounded-full hover:border-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={unlock}
              disabled={unlocking}
              className="flex-1 bg-taru-green text-taru-cream text-sm font-semibold py-2.5 rounded-full hover:bg-taru-green-dark transition-colors disabled:opacity-50"
            >
              {unlocking ? "Opening…" : "Unlock"}
            </button>
          </div>
        </div>
      )}

      {/* Portal */}
      {mode === "portal" && (
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-taru-cream shrink-0">
            <p className="font-heading text-lg font-bold text-taru-green">
              {location || "Untitled"} — Narrative Workshop
            </p>
            <button onClick={close} className="text-gray-300 hover:text-gray-500 text-sm transition-colors">
              ✕ Close
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Transcript */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-taru-green uppercase tracking-wider">Full Transcript</p>
                {transcript && (
                  <button
                    onClick={copyTranscript}
                    className="text-xs text-taru-green/60 hover:text-taru-green transition-colors"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                )}
              </div>
              {transcript ? (
                <textarea
                  readOnly
                  value={transcript}
                  className="w-full h-36 text-xs text-gray-600 border border-taru-cream rounded-xl p-3 bg-taru-sand resize-none focus:outline-none leading-relaxed"
                />
              ) : (
                <p className="text-sm text-gray-400 italic">No transcript yet — transcribe this video first.</p>
              )}
            </div>

            {/* Chat */}
            <div>
              <p className="text-[11px] font-semibold text-taru-green uppercase tracking-wider mb-4">Narrative Seeds</p>
              <div className="space-y-4">
                {visibleMessages.map((msg, i) => (
                  <div key={i} className={msg.role === "assistant" ? "bg-taru-sand rounded-xl p-4" : "pl-1"}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${msg.role === "assistant" ? "text-taru-green/60" : "text-gray-400"}`}>
                      {msg.role === "assistant" ? "Claude" : "You"}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                {chatLoading && (
                  <div className="bg-taru-sand rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-wider mb-1 text-taru-green/60">Claude</p>
                    <p className="text-xs text-gray-400 animate-pulse">Thinking…</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-taru-cream shrink-0">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask for a narrative angle, a different tone, a specific moment to develop…"
                rows={2}
                className="flex-1 border border-taru-cream rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand resize-none"
              />
              <button
                onClick={sendMessage}
                disabled={chatLoading || !input.trim()}
                className="bg-taru-green text-taru-cream text-lg font-semibold px-4 rounded-xl hover:bg-taru-green-dark transition-colors disabled:opacity-40 self-end pb-2"
              >
                →
              </button>
            </div>
            <p className="text-[10px] text-gray-300 mt-1">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}
    </div>
  );
}
