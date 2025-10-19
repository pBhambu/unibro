import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { DEFAULT_AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { prompt, apiKey } = await req.json();
    const text = await geminiText(
      `${DEFAULT_AI_PERSONALITY}\n\nFrom the following pasted college application questions, produce a compact JSON array of fields where each field has: id (slug), label (string), type ('text' or 'textarea' or 'select'), optional (boolean). For yes/no questions, use type 'select' with options ["Yes", "No"]. Keep labels short and clear. Set optional to false unless explicitly stated as optional. EXCLUDE questions already covered by Common App (GPA, SAT/ACT, AP tests, activities list, honors, additional info, main essay). Parse each question separately - do not combine multiple questions into one field. Only output JSON array, nothing else.\n\n${prompt}`,
      apiKey
    );
    try {
      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]");
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      return NextResponse.json({ fields: parsed });
    } catch {
      return NextResponse.json({ fields: [], error: 'parse_failed' });
    }
  } catch (err: any) {
    return NextResponse.json({ fields: [], error: "generation_failed" });
  }
}
