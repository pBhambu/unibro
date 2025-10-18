import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const text = await geminiText(
      `${AI_PERSONALITY}\n\nFrom the following pasted college application questions, produce a compact JSON array of fields where each field has: id (slug), label (string), type ('text' or 'textarea'), optional (boolean). Keep labels short and clear. EXCLUDE questions already covered by Common App (GPA, SAT/ACT, AP tests, activities list, honors, additional info, main essay). Only output JSON.\n\n${prompt}`
    );
    try {
      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]");
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      return NextResponse.json({ fields: parsed });
    } catch {
      return NextResponse.json({ fields: [] });
    }
  } catch (err: any) {
    return NextResponse.json({ fields: [], error: "generation_failed" });
  }
}
