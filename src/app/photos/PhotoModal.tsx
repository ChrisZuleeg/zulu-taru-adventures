"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faXmark, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import PhotoTileImage from "./PhotoTileImage";

type Comment = {
  id: number;
  text: string;
  author: string;
  reply: string | null;
  created_at: string;
};

type PhotoModalProps = {
  id: string;
  title: string;
  location: string | null;
  filmed_at: string | null;
  r2_url: string;
  candidates: string[];
  likes_count: number;
  onClose: () => void;
};

const STORAGE_KEY = (id: string) => `liked_photo_${id}`;

export default function PhotoModal({
  id,
  title,
  location,
  filmed_at,
  r2_url,
  candidates,
  likes_count: initialLikes,
  onClose,
}: PhotoModalProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [skyAnswer, setSkyAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Check localStorage for liked state
  useEffect(() => {
    setLiked(localStorage.getItem(STORAGE_KEY(id)) === "1");
  }, [id]);

  // Load comments
  useEffect(() => {
    fetch(`/api/comments?media_id=${id}`)
      .then((r) => r.json())
      .then((data) => { setComments(Array.isArray(data) ? data : []); setCommentsLoaded(true); });
  }, [id]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    localStorage.setItem(STORAGE_KEY(id), "1");
    setLikes((n) => n + 1);
    await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_id: id }),
    });
  }

  async function handleComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitError("");
    setSubmitting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_id: id,
        text,
        author,
        sky_answer: skyAnswer,
        photo_label: location || title,
        photo_date: filmed_at,
        photo_url: r2_url,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(data.error || "Something went wrong.");
      return;
    }
    setComments((prev) => [...prev, data]);
    setText("");
    setAuthor("");
    setSkyAnswer("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  const dateStr = filmed_at
    ? new Date(filmed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-taru-cream shrink-0">
          <div>
            <p className="font-semibold text-taru-green text-sm">{location || title}</p>
            {dateStr && <p className="text-xs text-gray-400">{dateStr}</p>}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={r2_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-taru-green border border-taru-green/30 px-3 py-1.5 rounded-full hover:bg-taru-green hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
              Full Size
            </a>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors ml-1">
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Photo */}
          <div className="aspect-[4/3] w-full bg-taru-cream relative">
            <PhotoTileImage candidates={candidates} alt={title} />
          </div>

          {/* Like bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-taru-cream">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
            >
              <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
              <span>{likes > 0 ? likes : ""}</span>
            </button>
            {liked && <span className="text-xs text-gray-400">Thanks for the love!</span>}
          </div>

          {/* Comments */}
          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold text-taru-green uppercase tracking-wider mb-3">
              Comments {commentsLoaded && comments.length > 0 ? `(${comments.length})` : ""}
            </p>

            {commentsLoaded && comments.length === 0 && (
              <p className="text-sm text-gray-400 italic mb-4">No comments yet — be the first!</p>
            )}

            <div className="space-y-3 mb-5">
              {comments.map((c) => (
                <div key={c.id} className="bg-taru-sand rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-taru-green mb-1">{c.author}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                  {c.reply && (
                    <div className="mt-2 pt-2 border-t border-taru-cream">
                      <p className="text-xs font-semibold text-taru-brown mb-0.5">Zulu</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Comment form */}
            {submitted ? (
              <p className="text-sm text-taru-green font-semibold text-center py-3">Thanks for your comment! 🙏</p>
            ) : (
              <form onSubmit={handleComment} className="space-y-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Leave a comment…"
                  rows={3}
                  required
                  className="w-full border border-taru-cream rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand resize-none"
                />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full border border-taru-cream rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
                />
                <div>
                  <label className="block text-xs text-gray-500 mb-1">What color is the sky? <span className="text-gray-400">(spam check)</span></label>
                  <input
                    type="text"
                    value={skyAnswer}
                    onChange={(e) => setSkyAnswer(e.target.value)}
                    placeholder="Your answer…"
                    required
                    className="w-full border border-taru-cream rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand"
                  />
                </div>
                {submitError && <p className="text-red-500 text-xs">{submitError}</p>}
                <button
                  type="submit"
                  disabled={submitting || !text.trim()}
                  className="w-full bg-taru-green text-taru-cream font-semibold py-2.5 rounded-full hover:bg-taru-green-dark transition-colors disabled:opacity-40 text-sm"
                >
                  {submitting ? "Posting…" : "Post Comment"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
