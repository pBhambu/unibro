import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { DEFAULT_AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate, profile } = await req.json();
    const dateRange = startDate ? `starting from ${startDate} and ending by ${endDate}` : `ending by ${endDate}`;
    const text = await geminiText(
      `${DEFAULT_AI_PERSONALITY}\n\nCreate a step-by-step admissions plan ${dateRange}. Output as lines of 'YYYY-MM-DD: Action'. Make sure all dates are within the specified range and do not include dates in the past. Include SAT/ACT timeline (if useful), 2-3 local opportunities based on location and interests, project ideas, and checkpoints.\n\nStudent profile: ${JSON.stringify(
        profile
      )}`
    );
    return NextResponse.json({ plan: text });
  } catch (err: any) {
    return NextResponse.json({ plan: "", error: "plan_generation_failed" });
  }
}
