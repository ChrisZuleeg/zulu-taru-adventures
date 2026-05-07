import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { driveFileId } from "@/lib/drive";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { PassThrough } from "stream";

export const maxDuration = 60;

ffmpeg.setFfmpegPath(ffmpegStatic as string);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractAudio(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const pass = new PassThrough();
    pass.on("data", (chunk: Buffer) => chunks.push(chunk));
    pass.on("end", () => resolve(Buffer.concat(chunks)));
    pass.on("error", reject);

    ffmpeg(url)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioBitrate("64k")
      .format("mp3")
      .output(pass)
      .on("error", reject)
      .run();
  });
}

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();

  if (password !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const { data: video, error: fetchError } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !video) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  const fileId = driveFileId(video.r2_url);
  if (!fileId) {
    return NextResponse.json({ error: "Could not extract Google Drive file ID." }, { status: 400 });
  }

  // Stream audio directly from Google Drive — no need to download the full video
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
  const audioBuffer = await extractAudio(downloadUrl);

  const fileSizeMB = audioBuffer.byteLength / (1024 * 1024);
  if (fileSizeMB > 24) {
    return NextResponse.json({
      error: `Audio is ${fileSizeMB.toFixed(1)}MB after extraction — clip is too long. Try a shorter video.`,
    }, { status: 413 });
  }

  const audioFile = new File([new Uint8Array(audioBuffer)], `${fileId}.mp3`, { type: "audio/mpeg" });

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    response_format: "text",
  });

  const transcript = typeof transcription === "string" ? transcription : (transcription as any).text;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `This is a transcript from a GoPro video taken during a road trip through the American Southwest in a 1976 VW Westfalia. Write a short, vivid 2–3 sentence summary of what happens in the video, written in third person ("Zulu..."). Keep it evocative and road-trip-y. Return only the summary, nothing else.\n\nTranscript:\n${transcript}`,
    }],
  });

  const summary = (message.content[0] as { type: string; text: string }).text;

  await supabase
    .from("media")
    .update({ transcript, summary })
    .eq("id", id);

  return NextResponse.json({ transcript, summary });
}
