import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { DEFAULT_AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { prompt, apiKey } = await req.json();
    const text = await geminiText(
      `You are a JSON parser. Parse the following text into form fields.

ABSOLUTE RULES - BREAKING THESE IS FORBIDDEN:
1. Each line separated by blank lines (\\n\\n) is a SEPARATE field. Count the blank line separators.
2. NEVER EVER combine text from different lines into one field.
3. If you see "diversity essay\\n\\npersonal statement essay", that is TWO fields, not one.
4. DO NOT extract answers - only create empty fields.
5. For essay titles (like "personal statement", "diversity essay"), use type "textarea".
6. For yes/no questions, use type "select" with options ["Yes", "No"].
7. For short questions, use type "text".

EXACT EXAMPLE YOU MUST FOLLOW:
Input text:
diversity essay

personal statement essay

are you low income (Y/N)?

Expected output (3 separate fields):
[
  {"id": "diversity-essay", "label": "Diversity Essay", "type": "textarea", "optional": false},
  {"id": "personal-statement-essay", "label": "Personal Statement Essay", "type": "textarea", "optional": false},
  {"id": "are-you-low-income", "label": "Are you low income?", "type": "select", "optional": false, "options": ["Yes", "No"]}
]

If you combine "personal statement essay" into the diversity essay field, you have FAILED.

Now parse this text (output ONLY valid JSON array):
${prompt}`,
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
