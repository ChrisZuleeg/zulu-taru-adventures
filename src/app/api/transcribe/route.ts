import Anthropic from "@anthropic-ai/sdk";
import { AssemblyAI } from "assemblyai";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { driveFileId } from "@/lib/drive";

function getAssembly() {
  const key = process.env.ASSEMBLYAI_API_KEY;
  if (!key) throw new Error("ASSEMBLYAI_API_KEY env var is not set in Vercel.");
  return new AssemblyAI({ apiKey: key });
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// POST — submit video to AssemblyAI, returns job_id immediately
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured on this environment." },
        { status: 500 }
      );
    }

    const { id, password } = await request.json();

    if (password !== process.env.WRITE_PASSWORD) {
      return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    }

    const { data: video, error } = await supabase
      .from("media")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !video) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    const fileId = driveFileId(video.r2_url);
    if (!fileId) {
      return NextResponse.json({ error: "Could not extract Google Drive file ID." }, { status: 400 });
    }

    const audioUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
    const transcript = await getAssembly().transcripts.submit({ audio_url: audioUrl, speech_models: ["universal-2"] });
    return NextResponse.json({ job_id: transcript.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("POST /api/transcribe error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET — poll job status; on completion summarise with Claude and save
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const job_id = searchParams.get("job_id");
  const media_id = searchParams.get("media_id");

  if (!job_id || !media_id) {
    return NextResponse.json({ error: "Missing job_id or media_id." }, { status: 400 });
  }

  const transcript = await getAssembly().transcripts.get(job_id);

  if (transcript.status === "error") {
    return NextResponse.json({ error: `Transcription failed: ${transcript.error}` }, { status: 500 });
  }

  if (transcript.status !== "completed") {
    return NextResponse.json({ status: transcript.status });
  }

  const supabase = getSupabase();
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!supabase || !anthropicKey) {
    return NextResponse.json(
      { error: "Supabase or Anthropic is not configured on this environment." },
      { status: 500 }
    );
  }
  const anthropic = new Anthropic({ apiKey: anthropicKey });

  const transcriptText = transcript.text ?? "";

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `This is a transcript from a GoPro video taken during a road trip through the American Southwest in a 1976 VW Westfalia. Write a short, vivid 2–3 sentence summary of what happens in the video, written in third person ("Zulu..."). Keep it evocative and road-trip-y. Return only the summary, nothing else.\n\nTranscript:\n${transcriptText}`,
    }],
  });

  const summary = (message.content[0] as { type: string; text: string }).text;

  await supabase
    .from("media")
    .update({ transcript: transcriptText, summary })
    .eq("id", media_id);

  return NextResponse.json({ status: "completed", summary, transcript: transcriptText });
}

// DELETE — clear transcript and summary so the video can be re-transcribed
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured on this environment." },
        { status: 500 }
      );
    }

    const { id, password } = await request.json();
    if (password !== process.env.WRITE_PASSWORD) {
      return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    }
    const { error } = await supabase
      .from("media")
      .update({ transcript: null, summary: null })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
