"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';

export function ChatbotPanel({ context }: { context?: any }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
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
    setMessages([]);
    localStorage.removeItem(storageKey);
    setShowClearConfirm(false);
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
        // Format plan items with proper date structure for the assistant
        const formattedPlanItems = context.planItems?.map((item: any) => ({
          id: item.id,
          date: item.date,
          action: item.action
        })) || [];
        systemInstructions = `\n\nCurrent Plan Items:\n${JSON.stringify(formattedPlanItems, null, 2)}\n\nIMPORTANT: When referring to plan items, use the exact dates shown above. Each item has a date field. If the user asks you to edit, update, or modify the plan, respond with a JSON code block containing the updated plan items. Format: \`\`\`json\n[{"id": "abc123", "date": "2025-01-15", "action": "Task description"}, ...]\n\`\`\`. The plan will be automatically updated.`;
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

  useEffect(() => {
    // Move the chat panel to the container
    const chatContainer = document.getElementById('chat-container');
    const panel = document.getElementById('chat-panel');
    
    if (chatContainer && panel) {
      chatContainer.appendChild(panel);
    }
    
    return () => {
      if (chatContainer && panel && panel.parentNode === chatContainer) {
        chatContainer.removeChild(panel);
      }
    };
  }, []);

  return (
    <div 
      id="chat-panel"
      className="w-80 md:w-72 h-[400px] md:h-[500px] max-h-[calc(100vh-2rem)] flex flex-col shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div className="h-full overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col shadow-xl">
        {/* Header - more compact */}
        <div className="border-b border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-2 md:p-3 flex items-center justify-between">
          <div className="font-medium">AI Assistant</div>
          {messages.length > 0 && (
            showClearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Clear chat?</span>
                <button 
                  onClick={clearConversation} 
                  className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded transition-colors"
                >
                  Yes
                </button>
                <button 
                  onClick={() => setShowClearConfirm(false)} 
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowClearConfirm(true)} 
                className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )
          )}
        </div>
      
      {/* Messages container - more compact */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-sm" style={{ maxHeight: 'calc(100% - 120px)' }}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-6">
            <div>
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">How can I help you today?</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ask me anything about your application process.</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div 
              key={i} 
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                  m.role === "user" 
                    ? "bg-emerald-600 text-white rounded-br-none" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                }`}
              >
                {m.role === "assistant" ? (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: m.content
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br/>') 
                    }} 
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Input area - more compact */}
      <div className="border-t border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-2">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              className="w-full min-h-[44px] max-h-32 py-2.5 px-4 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Type a message..."
              rows={1}
              value={input}
              onChange={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = (e.target.scrollHeight) + 'px';
                setInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              style={{
                minHeight: '44px',
                maxHeight: '160px',
                overflowY: 'auto'
              }}
            />
            <button 
              onClick={send} 
              disabled={loading || !input.trim()}
              className={`absolute bottom-2.5 right-2 p-1.5 rounded-lg ${
                input.trim() 
                  ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30' 
                  : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
