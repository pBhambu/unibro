const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

export function hasGemini() {
  return !!apiKey;
}

export async function geminiText(prompt: string, customApiKey?: string): Promise<string> {
  const key = customApiKey || apiKey;
  if (!key) return mockResponse(prompt);
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const res = await model.generateContent(prompt);
  return res.response.text();
}

export async function geminiWithPDF(prompt: string, pdfData: { mimeType: string; data: string }, customApiKey?: string): Promise<string> {
  const key = customApiKey || apiKey;
  if (!key) return mockResponse(prompt);
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const res = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: pdfData.mimeType,
        data: pdfData.data
      }
    }
  ]);
  return res.response.text();
}

function mockResponse(prompt: string) {
  if (prompt.toLowerCase().includes("chance")) return "72";
  if (prompt.toLowerCase().includes("essay")) return "• Strong voice and authenticity\n• Add 1 vivid anecdote to ground the theme\n• Tighter conclusion that echoes the opener\n• Replace generalities with specifics (names, numbers)\n• Trim 5–8% for concision";
  if (prompt.toLowerCase().includes("plan")) return `2025-10-01: Take SAT mock\n2025-11-10: Attend local hackathon\n2025-12-01: Submit EA applications`;
  return "This is a placeholder response. Add GOOGLE_GEMINI_API_KEY to use real AI.";
}
