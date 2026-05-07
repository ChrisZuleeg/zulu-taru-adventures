import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 60;

type Post = {
  id: number;
  type: string;
  title: string | null;
  body: string;
  location: string | null;
  published_at: string;
};

export default async function Journal() {
  let posts: Post[] | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false });
    posts = (data as Post[]) || [];
  }

  const hasPosts = posts && posts.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-4">Journal</h1>
      <p className="text-taru-brown italic text-lg mb-12">
        Dispatches from the road
      </p>

      {!hasPosts ? (
        <div className="bg-taru-cream rounded-2xl p-10 text-center">
          <p className="font-heading text-2xl text-taru-green font-bold mb-3">
            The road trip hasn&apos;t started yet.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Journal entries will appear here once Zulu and Taru hit the highway.
            Check back soon — the adventure is coming.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(posts as Post[]).map((post) => (
            post.type === "note" ? (
              <NoteCard key={post.id} post={post} />
            ) : (
              <JournalCard key={post.id} post={post} />
            )
          ))}
        </div>
      )}
    </div>
  );
}

function JournalCard({ post }: { post: Post }) {
  const date = new Date(post.published_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <Link href={`/journal/${post.id}`} className="block group">
      <div className="bg-white rounded-2xl p-7 shadow-sm border border-taru-cream hover:border-taru-green/40 transition-colors">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="font-heading text-2xl font-bold text-taru-green group-hover:text-taru-green-dark transition-colors">
            {post.title || "Untitled"}
          </h2>
          <span className="text-xs text-gray-400 whitespace-nowrap mt-1.5">{date}</span>
        </div>
        {post.location && (
          <p className="text-xs text-taru-brown mb-3">📍 {post.location}</p>
        )}
        <p className="text-gray-600 leading-relaxed line-clamp-3">{post.body}</p>
        <p className="text-taru-green text-sm font-medium mt-4 group-hover:underline">Read more →</p>
      </div>
    </Link>
  );
}

function NoteCard({ post }: { post: Post }) {
  const date = new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
  const time = new Date(post.published_at).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-1">
        <div className="w-2 h-2 rounded-full bg-taru-green mt-1.5 shrink-0" />
        <div className="w-px flex-1 bg-taru-green/20 mt-1" />
      </div>
      <div className="pb-2">
        <p className="text-xs text-gray-400 mb-1">{date} · {time}{post.location ? ` · ${post.location}` : ""}</p>
        {post.title && <p className="font-semibold text-taru-green mb-1">{post.title}</p>}
        <p className="text-gray-700 leading-relaxed">{post.body}</p>
      </div>
    </div>
  );
}
