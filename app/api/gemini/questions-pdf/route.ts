import { NextRequest, NextResponse } from "next/server";
import { geminiWithPDF } from "@/lib/gemini";
import { DEFAULT_AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const apiKey = formData.get('apiKey') as string | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const prompt = `${DEFAULT_AI_PERSONALITY}\n\nFrom the following PDF containing college application questions, produce a compact JSON array of fields where each field has: id (slug), label (string), type ('text' or 'textarea' or 'select'), optional (boolean). For yes/no questions, use type 'select' with options ["Yes", "No"]. Keep labels short and clear. EXCLUDE questions already covered by Common App (GPA, SAT/ACT, AP tests, activities list, honors, additional info, main essay). Only output JSON array, nothing else.`;

    const text = await geminiWithPDF(
      prompt,
      { mimeType: 'application/pdf', data: base64 },
      apiKey || undefined
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
    console.error('PDF question generation error:', err);
    return NextResponse.json({ fields: [], error: err.message || "generation_failed" }, { status: 500 });
  }
}
