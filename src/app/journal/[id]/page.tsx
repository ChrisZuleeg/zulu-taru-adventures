import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Post = {
  id: number;
  type: string;
  title: string | null;
  body: string;
  location: string | null;
  published_at: string;
};

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!supabase) notFound();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const post = data as Post;
  const date = new Date(post.published_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/journal" className="text-sm text-taru-brown hover:text-taru-green transition-colors mb-10 inline-block">
        ← Back to Journal
      </Link>

      <article>
        <h1 className="font-heading text-4xl font-bold text-taru-green mb-3">
          {post.title || "Untitled"}
        </h1>
        <div className="flex gap-3 text-sm text-gray-400 mb-10">
          <span>{date}</span>
          {post.location && <><span>·</span><span>📍 {post.location}</span></>}
        </div>
        <div className="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>
      </article>
    </div>
  );
}
