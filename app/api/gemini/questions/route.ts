import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const text = await geminiText(
    `From the following pasted college application questions, produce a compact JSON array of fields where each field has: id (slug), label (string), type ('text' or 'textarea'). Keep labels short and clear. Only output JSON.\n\n${prompt}`
  );
  try {
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return NextResponse.json({ fields: parsed });
  } catch {
    return NextResponse.json({ fields: [] });
  }
}
