"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

export default function CounselorBroPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [conversationActive, setConversationActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const clearConversation = () => {
    if (confirm('Clear this conversation?')) {
      setMessages([]);
      localStorage.removeItem('counselor.messages');
      if (conversationActive) {
        stopConversation();
      }
    }
  };

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('counselor.messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('counselor.messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition if available
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-send when input changes in conversation mode
  useEffect(() => {
    if (conversationActive && input && !isListening && !loading) {
      const timer = setTimeout(() => {
        sendMessage(input);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [input, conversationActive, isListening, loading]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const playAudio = async (text: string) => {
    if (!voiceEnabled) return;
    try {
      setIsSpeaking(true);
      const elevenlabsApiKey = localStorage.getItem('elevenlabsApiKey') || undefined;
      const res = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, apiKey: elevenlabsApiKey })
      });
      if (!res.ok) throw new Error('TTS failed');
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        // Auto-start listening again in conversation mode
        if (conversationActive && recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (e) {
              console.error('Failed to restart recognition:', e);
            }
          }, 500);
        }
      };
      await audioRef.current.play();
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;
    const userMsg = { role: "user", content: textToSend };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const enrichedContext = {
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
        },
        colleges: JSON.parse(localStorage.getItem("colleges") || "[]"),
        plan: localStorage.getItem("plan.table"),
      };
      const customPersonality = localStorage.getItem('customPersonality');
      const apiKey = localStorage.getItem('geminiApiKey') || undefined;
      const defaultPersonality = "You are CounselorBro, a friendly and knowledgeable college admissions counselor. Always refer to yourself as CounselorBro when appropriate.";
      const personality = customPersonality ? `${defaultPersonality} ${customPersonality}` : defaultPersonality;
      
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], context: enrichedContext, personality, apiKey }),
      });
      const txt = await res.text();
      let data: any = {};
      try { data = txt ? JSON.parse(txt) : {}; } catch { data = {}; }
      const text = res.ok ? (data.text || "") : "I'm having trouble responding right now.";
      setMessages((m) => [...m, { role: "assistant", content: text }]);
      if (conversationActive && voiceEnabled && text) {
        await playAudio(text);
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

  const send = () => sendMessage();

  const startConversation = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }
    setConversationActive(true);
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopConversation = () => {
    setConversationActive(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    stopAudio();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400 font-title">CounselorBro</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Your AI college counselor with voice support</div>
          </div>
          <div className="flex gap-2">
            {!conversationActive ? (
              <button
                onClick={startConversation}
                className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 font-medium"
              >
                Start Voice Conversation
              </button>
            ) : (
              <button
                onClick={stopConversation}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium"
              >
                Stop Conversation
              </button>
            )}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-xl ${voiceEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
              title={voiceEnabled ? "Voice enabled" : "Voice disabled"}
            >
              {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card h-[calc(100vh-16rem)] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Start a conversation with your counselor</p>
              <p className="text-sm mt-2">Ask about your chances, get essay feedback, or discuss your college list</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                m.role === "user" 
                  ? "bg-brand-600 text-white" 
                  : "bg-gray-100 text-gray-900"
              }`}>
                {m.role === "assistant" ? (
                  <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>') }} />
                ) : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-100 bg-white">
          {conversationActive ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                {isListening && (
                  <div className="flex gap-1">
                    <div className="w-2 h-8 bg-brand-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-10 bg-brand-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-8 bg-brand-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex gap-1">
                    <div className="w-2 h-8 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-10 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-8 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
                {loading && !isSpeaking && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {isListening && "Listening..."}
                {isSpeaking && "Speaking..."}
                {loading && !isSpeaking && "Thinking..."}
                {!isListening && !isSpeaking && !loading && "Ready to listen"}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={toggleListening}
                disabled={loading}
                className={`p-3 rounded-lg transition ${
                  isListening 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <input
                className="input flex-1"
                placeholder={isListening ? "Listening..." : "Ask your counselor anything..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={loading || isListening}
              />
              <button 
                className="btn disabled:opacity-50" 
                onClick={send} 
                disabled={loading || !input.trim()}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageCircle({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
