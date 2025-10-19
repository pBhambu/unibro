import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { DEFAULT_AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { college, profile, answers, apiKey } = await req.json();
    
    // First, get the percentage
    const percentText = await geminiText(
      `${DEFAULT_AI_PERSONALITY}\n\nEstimate a realistic admission probability (0-100 integer) for ${college}. Consider the whole profile holistically including activities, honors, context, interests, and college-specific responses. If some fields are missing, estimate based on available data and be conservative. Consider Reach/Target/Safety heuristics implicitly. Respond with ONLY the number.\n\nProfile JSON: ${JSON.stringify(
        profile
      )}\nAnswers JSON: ${JSON.stringify(answers)}`,
      apiKey
    );
    const percent = parseInt(percentText.match(/\d{1,3}/)?.[0] || "70");
    
    // Then, get the reasoning
    const reasoningText = await geminiText(
      `${DEFAULT_AI_PERSONALITY}\n\nYou estimated a ${percent}% admission probability for ${college}. Provide 3-5 concise bullet points explaining the key factors that led to this percentage. Focus on:\n- Strengths that increase chances\n- Weaknesses or gaps that lower chances\n- How the profile matches the college's typical admitted student\n- Specific aspects of their application (essays, activities, academics)\n\nProfile JSON: ${JSON.stringify(
        profile
      )}\nAnswers JSON: ${JSON.stringify(answers)}\n\nProvide bullet points (use • or -):`,
      apiKey
    );
    
    return NextResponse.json({ 
      percent: Math.max(0, Math.min(100, percent)),
      reasoning: reasoningText 
    });
  } catch (err: any) {
    return NextResponse.json({ percent: 70, reasoning: "", error: "chance_failed" });
  }
}
