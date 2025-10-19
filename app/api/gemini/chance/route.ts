import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { DEFAULT_AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { college, profile, answers, apiKey } = await req.json();
    const text = await geminiText(
      `${DEFAULT_AI_PERSONALITY}\n\nEstimate a realistic admission probability (0-100 integer) for ${college}. Consider the whole profile holistically including activities, honors, context, interests, and college-specific responses. If some fields are missing, estimate based on available data and be conservative. Consider Reach/Target/Safety heuristics implicitly. Respond with ONLY the number.\n\nProfile JSON: ${JSON.stringify(
        profile
      )}\nAnswers JSON: ${JSON.stringify(answers)}`,
      apiKey
    );
    const percent = parseInt(text.match(/\d{1,3}/)?.[0] || "70");
    return NextResponse.json({ percent: Math.max(0, Math.min(100, percent)) });
  } catch (err: any) {
    return NextResponse.json({ percent: 70, error: "chance_failed" });
  }
}
