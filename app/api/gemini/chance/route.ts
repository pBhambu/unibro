import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { college, profile, answers } = await req.json();
  const text = await geminiText(
    `Estimate a realistic admission probability (0-100 integer) for ${college}. Consider the whole profile holistically including activities, honors, context, interests, and college-specific responses. Consider Reach/Target/Safety heuristics implicitly. Respond with ONLY the number.\n\nProfile JSON: ${JSON.stringify(
      profile
    )}\nAnswers JSON: ${JSON.stringify(answers)}`
  );
  const percent = parseInt(text.match(/\d{1,3}/)?.[0] || "70");
  return NextResponse.json({ percent: Math.max(0, Math.min(100, percent)) });
}
