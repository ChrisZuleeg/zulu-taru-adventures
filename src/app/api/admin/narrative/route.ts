import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a narrative collaborator working with Zulu on his "Zulu and Taru Adventures" — a five-week road trip through the American Southwest in a beloved 1976 VW Westfalia named Taru. The soul of this journey is Joy Spreading: finding, noticing, and sharing the beauty, wonder, and human warmth hiding in everyday moments on the road. Zulu is newly retired and this is the biggest adventure of his life.

Your job is to help Zulu find the stories worth telling in his video transcripts, and to help shape those raw words into vivid, warmhearted narratives. Be conversational and curious. Ask good questions. Notice details that reveal character. Help Zulu hear his own voice — unhurried, joyful, genuinely alive to the world around him. When you write, write like someone who loves the road.`;

type Message = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  const { password, transcript, messages } = await request.json();

  if (password !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "Anthropic not configured." }, { status: 500 });

  const anthropic = new Anthropic({ apiKey: key });

  // Seed prompt when opening the portal for the first time
  const conversationMessages: Message[] = messages && messages.length > 0
    ? messages
    : transcript?.trim()
      ? [{ role: "user", content: `Here's a transcript from one of my GoPro videos taken on this road trip. What's the most interesting story hidden in this audio? What moment or detail jumps out at you that we could develop into something beautiful?\n\nTranscript:\n${transcript}` }]
      : [{ role: "user", content: "No transcript yet for this video. Just say hi and let me know to transcribe it first." }];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: conversationMessages,
  });

  const reply = (response.content[0] as { type: string; text: string }).text;
  return NextResponse.json({ reply });
}
