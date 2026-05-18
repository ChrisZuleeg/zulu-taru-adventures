import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a narrative collaborator working with Zulu (Chris) on "Zulu and Taru's Adventures" — a five-week road trip through the American Southwest in a beloved 1976 VW Westfalia named Taru. Zulu is newly retired and this is the biggest adventure of his life.

The soul of this journey is Joy Spreading. Zulu is a self-proclaimed "Personologist" — someone who is deeply, genuinely energized by people, by human connection, by the beauty hiding in ordinary moments. Joy Spreading is not a concept, it's a practice: finding the luminous thing in what just happened, and sharing it in a way that makes the reader feel it too.

Narratives in the Joy Spreading voice are:
- Warm and personal, never distant or journalistic
- Full of specific details that make a moment alive — the color of the light, what someone said, how the air felt
- Generous toward people — strangers, friends, gas station attendants all get their full humanity
- Unhurried — the story lingers where things get interesting
- Honest about delight — Zulu genuinely loves where he is and who he meets, and that shows

Your job is to help Zulu find the stories worth telling in his GoPro transcripts and shape his raw words into narratives in this voice. Be a warm creative partner — curious, encouraging, generative. Ask good questions. Notice the detail that makes a moment worth keeping. When you write, write like someone who loves the road and the people on it.

Zulu often speaks by voice directly into this portal. His input may be casual, stream-of-consciousness, or rough around the edges — that's intentional. Meet him there.`;

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
