"use client";
import { useState, useEffect } from "react";

export function ChatbotPanel({ context }: { context?: any }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Generate a unique storage key based on the page context
  const storageKey = `chat.${context?.page || 'default'}${context?.college ? '.' + context.college : ''}`;
  
  // Load messages from localStorage on mount and when storage key changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    } else {
      // Clear messages if no saved data for this key
      setMessages([]);
    }
  }, [storageKey]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);
  
  const clearConversation = () => {
    if (confirm('Clear this conversation?')) {
      setMessages([]);
      localStorage.removeItem(storageKey);
    }
  };

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input } as const;
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      let systemInstructions = '';
      if (context?.page === 'plan') {
        systemInstructions = '\n\nIMPORTANT: If the user asks you to edit, update, or modify the plan, respond with a JSON code block containing the updated plan items. Format: ```json\n[{"id": "abc123", "date": "2025-01-15", "action": "Task description"}, ...]\n```. The plan will be automatically updated.';
      }
      const enrichedContext = {
        ...context,
        systemInstructions,
        profile: {
          majors: localStorage.getItem("profile.majors"),
          location: localStorage.getItem("profile.location"),
          school: localStorage.getItem("profile.school"),
          extras: localStorage.getItem("profile.extras"),
        },
        commonApp: {
          gpa: localStorage.getItem("app.gpa"),
          sat: localStorage.getItem("app.sat"),
          ap: localStorage.getItem("app.ap"),
          activities: localStorage.getItem("app.activities"),
          honors: localStorage.getItem("app.honors"),
          additional: localStorage.getItem("app.additional"),
          essay: localStorage.getItem("app.essay.main"),
        }
      };
      const personality = localStorage.getItem('customPersonality') || undefined;
      const apiKey = localStorage.getItem('geminiApiKey') || undefined;
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], context: enrichedContext, personality, apiKey }),
      });
      const txt = await res.text();
      let data: any = {};
      try { data = txt ? JSON.parse(txt) : {}; } catch { data = {}; }
      // Show the actual error message from the API, not a generic fallback
      const text = data.text || data.error || "I'm having trouble responding right now.";
      setMessages((m) => [...m, { role: "assistant", content: text }]);
      
      // Check if assistant wants to edit the plan
      if (context?.page === 'plan' && text.includes('```json') && typeof window !== 'undefined' && (window as any).updatePlan) {
        try {
          const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
          if (jsonMatch) {
            const planData = JSON.parse(jsonMatch[1]);
            if (Array.isArray(planData)) {
              (window as any).updatePlan(planData);
            }
          }
        } catch (e) {
          console.error('Failed to parse plan update:', e);
        }
      }
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't respond right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card sticky top-4 h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
      <div className="font-semibold p-4 pb-2 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10 flex items-center justify-between">
        <span>Assistant</span>
        {messages.length > 0 && (
          <button onClick={clearConversation} className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
            Clear
          </button>
        )}
      </div>
      <div className="space-y-2 p-4 flex-1 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`${m.role === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${m.role === "user" ? "bg-brand-600 text-white" : "bg-gray-100"}`}>
              {m.role === "assistant" ? (
                <span dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>') }} />
              ) : m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Ask for help or feedback..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="btn" onClick={send} disabled={loading}>{loading ? "..." : "Send"}</button>
        </div>
      </div>
    </div>
  );
}
