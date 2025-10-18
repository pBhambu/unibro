import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { essay } = await req.json();
    const text = await geminiText(
      `Provide concise, actionable feedback for the following college application essay. Focus on narrative arc, authenticity, clarity, and specificity. Return 4-8 bullet points.\n\nEssay:\n${essay}`
    );
    return NextResponse.json({ text });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Unknown error';
    return NextResponse.json({ text: "I couldn't generate feedback right now. Please try again.", error: message });
  }
}
