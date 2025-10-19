const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

export function hasGemini() {
  return !!apiKey;
}

export async function geminiText(prompt: string, customApiKey?: string): Promise<string> {
  const key = customApiKey || apiKey;
  if (!key) return mockResponse(prompt);
  
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const res = await model.generateContent(prompt);
    return res.response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    
    // Extract the actual error message from Gemini
    const errorDetails = error?.status?.details || error?.details || [];
    const retryInfo = errorDetails.find((d: any) => d['@type']?.includes('RetryInfo'));
    const retryDelay = retryInfo?.retryDelay || 'unknown';
    
    // Check if it's a rate limit error
    if (error.message?.includes("RESOURCE_EXHAUSTED") || error.status?.code === 429 || error.message?.includes("429")) {
      throw new Error(`⏳ Rate Limit Hit: You've exceeded the Gemini API rate limit (15 requests/minute). Google is asking you to wait ${retryDelay} before trying again. Full error: ${error.message}`);
    }
    
    // Check if it's an invalid API key
    if (error.message?.includes("API_KEY_INVALID") || error.status?.code === 401 || error.message?.includes("401")) {
      throw new Error(`🔑 Invalid API Key: ${error.message}`);
    }
    
    // For any other error, pass through the full message
    throw new Error(`Gemini API Error: ${error.message || JSON.stringify(error)}`);
  }
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
  if (prompt.toLowerCase().includes("json array")) {
    // Mock response for questions endpoint
    return JSON.stringify([
      { id: "essay1", label: "Why do you want to attend this college?", type: "textarea", optional: false },
      { id: "essay2", label: "What will you contribute to our community?", type: "textarea", optional: false },
      { id: "major", label: "Intended major", type: "text", optional: false }
    ]);
  }
  return "This is a placeholder response. Add GOOGLE_GEMINI_API_KEY to use real AI.";
}
