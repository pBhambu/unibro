import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { DEFAULT_AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { essay, apiKey } = await req.json();
    const text = await geminiText(
      `${DEFAULT_AI_PERSONALITY}\n\nProvide concise, actionable feedback for the following college application essay. Focus on narrative arc, authenticity, clarity, and specificity. Return 4-8 bullet points.\n\nEssay:\n${essay}`,
      apiKey
    );
    return NextResponse.json({ text });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Unknown error';
    return NextResponse.json({ text: "I couldn't generate feedback right now. Please try again.", error: message });
  }
}
