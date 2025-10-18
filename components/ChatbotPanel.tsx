"use client";
import { useState } from "react";

export function ChatbotPanel({ context }: { context?: any }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input } as const;
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], context }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.text }]);
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
    <div className="card p-4 sticky top-4 max-h-[80vh] overflow-auto">
      <div className="font-semibold mb-2">Assistant</div>
      <div className="space-y-2 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`${m.role === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${m.role === "user" ? "bg-brand-600 text-white" : "bg-gray-100"}`}>
              {m.content}
            </span>
          </div>
        ))}
      </div>
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
  );
}
