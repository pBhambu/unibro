import { NextRequest, NextResponse } from "next/server";
import { geminiText, hasGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json();
  const prompt = `You are an AI college admissions copilot. Use the given context and chat history to help the student. Context: ${JSON.stringify(
    context
  )}. Chat: ${JSON.stringify(messages)}.`;
  const text = await geminiText(prompt);
  return NextResponse.json({ text, provider: hasGemini() ? "gemini" : "mock" });
}
