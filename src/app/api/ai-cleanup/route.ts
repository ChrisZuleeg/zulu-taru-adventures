import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const { body, type } = await request.json();

  if (!body?.trim()) {
    return NextResponse.json({ error: "No text to clean up." }, { status: 400 });
  }

  const prompt = type === "note"
    ? `Clean up this quick road note — fix any speech-to-text errors, punctuation, and grammar, but keep it short, casual, and in the writer's voice. Don't add anything new. Return only the cleaned text, nothing else.\n\n${body}`
    : `Clean up this journal entry dictated via voice — fix speech-to-text errors, punctuation, and grammar. Keep it in the writer's personal voice, warm and conversational. Don't add new content or make it more formal. Return only the cleaned text, nothing else.\n\n${body}`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const cleaned = (message.content[0] as { type: string; text: string }).text;
  return NextResponse.json({ cleaned });
}
