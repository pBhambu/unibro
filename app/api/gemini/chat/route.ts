import { NextRequest, NextResponse } from "next/server";
import { geminiText, hasGemini } from "@/lib/gemini";
import { DEFAULT_AI_PERSONALITY } from "@/lib/ai-personality";

export async function POST(req: NextRequest) {
  try {
    const { messages, context, personality, apiKey } = await req.json();
    const aiPersonality = personality || DEFAULT_AI_PERSONALITY;
    const prompt = `${aiPersonality}\n\nYou are an AI college admissions copilot. Use the given context and chat history to help the student. Context: ${JSON.stringify(
      context
    )}. Chat: ${JSON.stringify(messages)}.`;
    const text = await geminiText(prompt, apiKey);
    return NextResponse.json({ text, provider: hasGemini() ? "gemini" : "mock" });
  } catch (err: any) {
    console.error("Chat API error:", err);
    
    // Pass through the actual error message from Gemini
    const errorMessage = err.message || "Unknown error";
    
    // Determine status code
    let status = 500;
    if (errorMessage.includes("Rate Limit") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      status = 429;
    } else if (errorMessage.includes("Invalid API Key") || errorMessage.includes("API_KEY_INVALID")) {
      status = 401;
    }
    
    return NextResponse.json({ 
      text: errorMessage, 
      error: errorMessage 
    }, { status });
  }
}
