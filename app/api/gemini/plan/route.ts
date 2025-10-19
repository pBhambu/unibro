import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { DEFAULT_AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate, profile, customPrompt, existingPlan, apiKey } = await req.json();
    const dateRange = startDate ? `starting from ${startDate} and ending by ${endDate}` : `ending by ${endDate}`;
    
    let prompt = `${DEFAULT_AI_PERSONALITY}\n\n`;
    
    if (existingPlan) {
      // Modify existing plan
      prompt += `The user has an existing college admissions plan. Please modify it based on their new instructions.\n\n`;
      prompt += `EXISTING PLAN:\n${existingPlan}\n\n`;
      prompt += `NEW INSTRUCTIONS:\n`;
      if (customPrompt) {
        prompt += `- ${customPrompt}\n`;
      }
      prompt += `- Date range: ${dateRange}\n`;
      prompt += `- Make sure all dates are within the specified range and do not include dates in the past\n\n`;
      prompt += `Output the MODIFIED plan as lines of 'YYYY-MM-DD: Action'. Keep items that are still relevant and adjust/add/remove items as needed based on the instructions.\n\n`;
    } else {
      // Create new plan
      prompt += `Create a step-by-step admissions plan ${dateRange}. Output as lines of 'YYYY-MM-DD: Action'. Make sure all dates are within the specified range and do not include dates in the past. Include SAT/ACT timeline (if useful), 2-3 local opportunities based on location and interests, project ideas, and checkpoints.\n\n`;
      if (customPrompt) {
        prompt += `Additional instructions: ${customPrompt}\n\n`;
      }
    }
    
    prompt += `Student profile: ${JSON.stringify(profile)}`;
    
    const text = await geminiText(prompt, apiKey);
    
    // Generate a summary of the plan
    const summaryPrompt = `${DEFAULT_AI_PERSONALITY}\n\nBased on this college admissions plan, provide a brief summary (3-4 sentences) covering:\n- Main strategy and approach\n- Key milestones and goals\n- Important things the student should know\n\nPlan:\n${text}\n\nProvide a concise, actionable summary:`;
    
    const summary = await geminiText(summaryPrompt, apiKey);
    
    return NextResponse.json({ plan: text, summary });
  } catch (err: any) {
    return NextResponse.json({ plan: "", error: "plan_generation_failed" });
  }
}
