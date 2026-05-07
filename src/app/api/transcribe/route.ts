import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { driveFileId } from "@/lib/drive";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();

  if (password !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  // Fetch the video row
  const { data: video, error: fetchError } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !video) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  // Download from Google Drive
  const fileId = driveFileId(video.r2_url);
  if (!fileId) {
    return NextResponse.json({ error: "Could not extract Google Drive file ID." }, { status: 400 });
  }

  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const videoRes = await fetch(downloadUrl);
  if (!videoRes.ok) {
    return NextResponse.json({ error: "Failed to download video from Google Drive." }, { status: 502 });
  }

  const videoBuffer = await videoRes.arrayBuffer();
  const videoFile = new File([videoBuffer], `${fileId}.mp4`, { type: "video/mp4" });

  // Transcribe with Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: videoFile,
    model: "whisper-1",
    response_format: "text",
  });

  const transcript = typeof transcription === "string" ? transcription : (transcription as any).text;

  // Summarize with Claude
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `This is a transcript from a GoPro video taken during a road trip through the American Southwest in a 1976 VW Westfalia. Write a short, vivid 2–3 sentence summary of what happens in the video, written in second person ("Zulu..."). Keep it evocative and road-trip-y. Return only the summary, nothing else.\n\nTranscript:\n${transcript}`,
    }],
  });

  const summary = (message.content[0] as { type: string; text: string }).text;

  // Save to database
  const { error: updateError } = await supabase
    .from("media")
    .update({ transcript, summary })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ transcript, summary });
}
