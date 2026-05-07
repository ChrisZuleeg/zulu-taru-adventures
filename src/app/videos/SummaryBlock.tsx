"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SummaryBlock({ id, summary }: { id: string; summary: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function confirmDelete() {
    setDeleting(false);
    setError("");
    const res = await fetch("/api/transcribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(res.status === 401 ? "Wrong password." : data.error || "Delete failed.");
      setDeleting(true);
      return;
    }
    router.refresh();
  }

  if (deleting) {
    return (
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-1">Enter password to delete this summary:</p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmDelete()}
            placeholder="Password"
            autoFocus
            className="flex-1 border border-taru-cream rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
          />
          <button
            onClick={confirmDelete}
            className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => { setDeleting(false); setError(""); }}
            className="text-xs text-gray-400 hover:text-gray-600 px-2"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-2 group relative">
      <p className="text-sm text-gray-600 leading-relaxed italic">{summary}</p>
      <button
        onClick={() => setDeleting(true)}
        className="mt-1 text-xs text-gray-300 hover:text-red-400 transition-colors"
      >
        ✕ delete summary
      </button>
    </div>
  );
}
