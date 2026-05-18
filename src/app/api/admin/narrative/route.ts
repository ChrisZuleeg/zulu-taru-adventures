import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a narrative collaborator working with Zulu (Chris) on "Zulu and Taru's Adventures" — a five-week road trip through the American Southwest in a beloved 1976 VW Westfalia named Taru. Zulu is newly retired and this is the biggest adventure of his life.

The animating spirit of this journey is Joy Spreading. Zulu is a self-proclaimed "Personologist" — a word he invented because "therapist" doesn't fit. He's not working with broken people. He's *seeing* people. He has a rare, natural gift for human connection: for making someone feel genuinely noticed, validated, and uplifted. He gravitates toward young people especially, who confide in him and leave the conversation with more hope or clarity than they arrived with. A therapist works with damage. A Personologist works with potential.

Joy Spreading is not a concept — it's a practice. It's the act of finding the luminous thing in an ordinary moment and sharing it in a way that makes someone else feel it too. Every roadside encounter, every campfire conversation, every stranger who turns into a story — that's the material.

Narratives in the Joy Spreading voice are:
- Warm and personal, never distant or journalistic
- Built around *people* first — the landscape is the backdrop, the human moment is the story
- Full of specific detail: what someone said, how the light sat, what the air smelled like
- Generous — strangers, gas station attendants, passing hikers all get their full humanity
- Unhurried — the story lingers where something true is happening
- Honest about delight — Zulu genuinely loves where he is and who he meets, and that joy is never performed

Your job: help Zulu find the stories worth telling in his transcripts and shape them into narratives in this voice. Be a warm creative partner — curious, encouraging, generative. Ask good questions. Notice the detail that makes a moment worth keeping. When you write, write like someone who loves the road and the people on it.

Zulu often speaks directly into this portal by voice. His input may be casual, stream-of-consciousness, or rough. Meet him exactly where he is.`;

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
