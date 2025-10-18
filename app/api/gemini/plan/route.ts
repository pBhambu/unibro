import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { endDate, profile } = await req.json();
    const text = await geminiText(
      `${AI_PERSONALITY}\n\nCreate a step-by-step admissions plan ending by ${endDate}. Output as lines of 'YYYY-MM-DD: Action'. Include SAT/ACT timeline (if useful), 2-3 local opportunities based on location and interests, project ideas, and checkpoints.\n\nStudent profile: ${JSON.stringify(
        profile
      )}`
    );
    return NextResponse.json({ plan: text });
  } catch (err: any) {
    return NextResponse.json({ plan: "", error: "plan_generation_failed" });
  }
}
