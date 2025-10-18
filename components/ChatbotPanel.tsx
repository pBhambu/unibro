"use client";
import { useState } from "react";

export function ChatbotPanel({ context }: { context?: any }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const clearConversation = () => {
    if (confirm('Clear this conversation?')) {
      setMessages([]);
    }
  };

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input } as const;
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const enrichedContext = {
        ...context,
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
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], context: enrichedContext, personality }),
      });
      const txt = await res.text();
      let data: any = {};
      try { data = txt ? JSON.parse(txt) : {}; } catch { data = {}; }
      const text = res.ok ? (data.text || "") : "I'm having trouble responding right now.";
      setMessages((m) => [...m, { role: "assistant", content: text }]);
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
      <div className="p-4 pt-2 border-t border-gray-100 bg-white">
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
