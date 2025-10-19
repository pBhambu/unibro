"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Loader2 } from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function CounselorBro() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const interimTranscriptRef = useRef<string>('');
  const conversationModeRef = useRef<boolean>(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Changed to false for better end detection
        recognitionRef.current.interimResults = true; // Changed to true for better responsiveness
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: any) => {
          const results = Array.from(event.results);
          
          // Get all transcripts (both interim and final)
          const allTranscripts = results
            .map((result: any) => result[0].transcript)
            .join('');
          
          // Update interim transcript
          interimTranscriptRef.current = allTranscripts;
          
          // Clear existing timeout
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }
          
          // Check if we have a final result
          const hasFinalResult = results.some((result: any) => result.isFinal);
          
          if (hasFinalResult) {
            // Final result detected - send immediately
            const finalText = allTranscripts.trim();
            if (finalText) {
              console.log('Final speech result:', finalText);
              // Show the message in chat immediately
              setMessages(prev => [...prev, { role: "user" as const, content: finalText }]);
              // Stop listening and send
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch (e) {
                  console.error('Error stopping recognition:', e);
                }
              }
              setIsListening(false);
              sendMessage(finalText, true);
              interimTranscriptRef.current = '';
            }
          } else {
            // Interim result - set timeout for silence detection (1 second)
            speechTimeoutRef.current = setTimeout(() => {
              const currentText = interimTranscriptRef.current.trim();
              if (currentText) {
                console.log('Timeout - sending speech:', currentText);
                // Show the message in chat immediately
                setMessages(prev => [...prev, { role: "user" as const, content: currentText }]);
                // Stop listening and send
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {
                    console.error('Error stopping recognition:', e);
                  }
                }
                setIsListening(false);
                sendMessage(currentText, true);
                interimTranscriptRef.current = '';
              }
            }, 1000); // Reduced to 1 second for faster response
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          // Don't stop on 'no-speech' or 'aborted' errors if in conversation mode
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setIsListening(false);
            if (event.error === 'not-allowed') {
              setAudioError('Microphone access denied. Please allow microphone access.');
            }
          }
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          // If we're in conversation mode and not currently processing, restart
          if (conversationModeRef.current && !loading && !isSpeaking) {
            console.log('Auto-restarting recognition in conversation mode');
            setTimeout(() => {
              if (conversationModeRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  setIsListening(true);
                } catch (e) {
                  console.error('Error restarting recognition:', e);
                }
              }
            }, 100);
          } else {
            setIsListening(false);
          }
        };
      }
    }

    // Load messages from localStorage on mount
    const saved = localStorage.getItem('counselor.messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('counselor.messages', JSON.stringify(messages));
    }
  }, [messages]);

  const clearConversation = () => {
    if (confirm('Clear conversation history?')) {
      setMessages([]);
      localStorage.removeItem('counselor.messages');
    }
  };

  const startConversation = () => {
    if (!recognitionRef.current) {
      setAudioError('Speech recognition not supported in this browser');
      return;
    }
    
    // Don't allow starting while loading or speaking
    if (loading || isSpeaking) return;
    
    // Clear any previous errors
    setAudioError(null);
    
    // Start conversation mode
    setConversationMode(true);
    conversationModeRef.current = true;
    
    try {
      console.log('Starting conversation mode');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      console.error('Error starting speech recognition:', e);
      setConversationMode(false);
      conversationModeRef.current = false;
      setAudioError('Failed to start speech recognition: ' + e.message);
    }
  };
  
  const stopConversation = () => {
    console.log('Stopping conversation mode');
    setConversationMode(false);
    conversationModeRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    interimTranscriptRef.current = '';
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    // Restart listening if in conversation mode
    if (conversationMode && recognitionRef.current && !isMuted) {
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }, 100);
    }
  };

  const speak = useCallback(async (text: string) => {
    console.log('Speak called, isMuted:', isMuted, 'conversationMode:', conversationModeRef.current);
    if (isMuted) return;
    
    // CRITICAL: Stop speech recognition before AI speaks to prevent echo loop
    if (recognitionRef.current && isListening) {
      console.log('Stopping speech recognition before AI speaks');
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {
        console.error('Error stopping recognition before speak:', e);
      }
    }
    
    setAudioError(null);
    
    // Stop any ongoing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsSpeaking(true);
    
    try {
      // Get API key from localStorage (optional - will use env variable as fallback)
      const apiKey = localStorage.getItem('elevenlabsApiKey') || undefined;
      
      console.log('Starting TTS request...');
      
      // Get custom voice ID if set
      const customVoiceId = localStorage.getItem('settings.elevenlabsVoiceId');
      
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          apiKey,
          voiceId: customVoiceId || undefined 
        }),
      });
      
      console.log('TTS response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS error response:', errorText);
        throw new Error(`TTS request failed: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      console.log('Audio blob size:', audioBlob.size, 'type:', audioBlob.type);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      console.log('Audio element created, attempting to play...');
      
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        // Auto-restart listening only if in conversation mode
        if (conversationModeRef.current && recognitionRef.current && !isMuted) {
          console.log('Attempting to restart listening after audio ended');
          // Increased delay to ensure audio has completely stopped and prevent echo
          setTimeout(() => {
            if (conversationModeRef.current && recognitionRef.current) {
              try {
                console.log('Restarting speech recognition');
                recognitionRef.current.start();
                setIsListening(true);
              } catch (e) {
                console.error('Failed to restart recognition:', e);
              }
            }
          }, 1000); // Increased from 500ms to 1000ms
        }
      };
      
      await audio.play().then(() => {
        console.log('Audio playback started successfully');
      }).catch(err => {
        console.error('Audio play error:', err);
        setIsSpeaking(false);
        setAudioError('Failed to play audio. Check your ElevenLabs API key.');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      });
    } catch (error) {
      console.error('TTS error:', error);
      setAudioError('Failed to generate speech');
      setIsSpeaking(false);
    }
  }, [isMuted]);

  const sendMessage = async (messageContent?: string, skipAddingMessage = false) => {
    const content = messageContent || input;
    if (!content.trim()) return;
    
    // Only add message if not already added (voice messages add it immediately)
    if (!skipAddingMessage) {
      const userMessage = { role: "user" as const, content };
      setMessages(prev => {
        // Check if this message was already added (prevent duplicates)
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'user' && lastMessage.content === content) {
          return prev; // Don't add duplicate
        }
        return [...prev, userMessage];
      });
    }
    if (!messageContent) {
      setInput("");
    }
    setLoading(true);

    try {
      // Get comprehensive user data from localStorage
      const userData = {
        profile: {
          majors: localStorage.getItem('profile.majors'),
          location: localStorage.getItem('profile.location'),
          school: localStorage.getItem('profile.school'),
          extras: localStorage.getItem('profile.extras')
        },
        scores: {
          satMath: localStorage.getItem('app.sat.math'),
          satReading: localStorage.getItem('app.sat.reading'),
          satTotal: localStorage.getItem('app.sat.total'),
          actComposite: localStorage.getItem('app.act.composite')
        },
        education: {
          currentSchool: localStorage.getItem('education.current.school'),
          city: localStorage.getItem('education.current.city'),
          state: localStorage.getItem('education.current.state'),
          country: localStorage.getItem('education.current.country'),
          startDate: localStorage.getItem('education.current.startDate'),
          endDate: localStorage.getItem('education.current.endDate'),
          otherSchools: localStorage.getItem('education.other.schools'),
          colleges: localStorage.getItem('education.colleges'),
          currentGPA: localStorage.getItem('education.grades.current'),
          cumulativeGPA: localStorage.getItem('education.grades.cumulative'),
          weightedGPA: localStorage.getItem('education.grades.weighted'),
          classRank: localStorage.getItem('education.grades.classRank'),
          grade9Courses: localStorage.getItem('education.courses.grade9'),
          grade10Courses: localStorage.getItem('education.courses.grade10'),
          grade11Courses: localStorage.getItem('education.courses.grade11'),
          grade12Courses: localStorage.getItem('education.courses.grade12'),
          apTests: localStorage.getItem('education.ap'),
          activities: localStorage.getItem('education.activities'),
          honors: localStorage.getItem('education.honors'),
          additional: localStorage.getItem('education.additional')
        },
        essay: {
          main: localStorage.getItem('app.essay.main'),
          feedback: localStorage.getItem('app.essay.feedback')
        },
        colleges: JSON.parse(localStorage.getItem('colleges') || '[]'),
        plan: {
          startDate: localStorage.getItem('plan.startDate'),
          endDate: localStorage.getItem('plan.endDate'),
          items: JSON.parse(localStorage.getItem('plan.items') || '[]')
        }
      };

      const customPersonality = localStorage.getItem('customPersonality') || '';
      const basePersonality = `You are CounselorBro, a realistic and direct college admissions counselor.
        You have COMPLETE access to the user's profile, test scores, education history, courses and grades from all 4 years, 
        activities, honors, essay, college list with their specific information, and application plan.
        Be honest and realistic like a real college counselor - do not overly praise the user like an AI.
        Keep your responses concise and to the point. When the user asks about their information, reference specific details from their data.`;
      const defaultPersonality = customPersonality ? `${basePersonality}\n\nAdditional instructions: ${customPersonality}` : basePersonality;

      const apiKey = localStorage.getItem('geminiApiKey') || undefined;
      
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            { role: 'user', content }
          ],
          context: userData,
          personality: defaultPersonality,
          apiKey
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      const assistantMessage = { role: "assistant" as const, content: data.text };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response (strip markdown for TTS)
      const cleanText = data.text
        .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold markers
        .replace(/\*(.+?)\*/g, '$1')      // Remove italic markers
        .replace(/\n/g, ' ');             // Replace newlines with spaces
      speak(cleanText);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  return (
    <div className="fixed top-4 right-4 bottom-4 z-50 w-80 flex flex-col bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#31BD01] to-[#2bd600] text-white p-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <h2 className="font-bold text-base">CounselorBro</h2>
            <p className="text-xs opacity-90 hidden sm:block">AI Counselor</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!conversationMode ? (
            <button
              onClick={startConversation}
              disabled={loading || isSpeaking}
              className="px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white/20 text-white hover:bg-white/30 font-medium text-xs whitespace-nowrap flex items-center gap-1.5"
              aria-label="Start conversation"
              title={loading || isSpeaking ? "Please wait..." : "Start voice conversation"}
            >
              <Mic size={14} />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={stopConversation}
              className="px-3 py-1.5 rounded-lg transition-all bg-red-500/90 text-white hover:bg-red-600 font-medium text-xs whitespace-nowrap flex items-center gap-1.5 animate-pulse"
              aria-label="Stop conversation"
              title="Stop voice conversation"
            >
              <MicOff size={14} />
              <span>Stop</span>
            </button>
          )}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-3 py-1.5 rounded-lg transition-all bg-orange-500/90 text-white hover:bg-orange-600 font-medium text-xs whitespace-nowrap flex items-center gap-1.5"
              aria-label="Skip voice reply"
              title="Skip voice reply"
            >
              <span>Skip</span>
            </button>
          )}
          <button 
            onClick={toggleMute} 
            className={`p-1.5 rounded-lg transition-all ${isMuted ? 'bg-white/10 text-white/60 hover:bg-white/20' : 'bg-white/20 text-white hover:bg-white/30'}`}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <button 
            onClick={clearConversation}
            className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-all text-white font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#31BD01]/20 to-[#2bd600]/20 flex items-center justify-center mb-4">
              <MessageCircle size={32} className="text-[#31BD01]" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">How can I help you?</h3>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">Ask about your application, college list, or get advice!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-[#31BD01] to-[#2bd600] text-white rounded-br-sm' 
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div 
                    className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: msg.content
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br/>') 
                    }} 
                  />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && !isSpeaking && sendMessage()}
                placeholder={loading || isSpeaking ? "Please wait..." : "Type your message..."}
                className="w-full px-4 py-2.5 pr-12 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#31BD01] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || isSpeaking}
              />
              <button
                onClick={() => input.trim() && sendMessage()}
                disabled={!input.trim() || loading || isSpeaking}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#31BD01] hover:text-[#2bd600] disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {(isListening || isSpeaking || loading) && (
            <div className="flex items-center justify-center gap-2 mt-3">
              {loading && (
                <div className="flex items-center gap-2 text-xs text-[#31BD01] dark:text-[#5ae02a]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="font-medium">Thinking...</span>
                </div>
              )}
              {isSpeaking && !loading && (
                <div className="flex items-center gap-2 text-xs text-[#31BD01] dark:text-[#5ae02a]">
                  <div className="flex gap-1">
                    <span className="w-1 h-3 bg-[#31BD01] rounded-full animate-pulse"></span>
                    <span className="w-1 h-3 bg-[#31BD01] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-1 h-3 bg-[#31BD01] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                  </div>
                  <span className="font-medium">Speaking...</span>
                </div>
              )}
              {isListening && !loading && !isSpeaking && (
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Listening...</span>
                </div>
              )}
            </div>
          )}
          {audioError && (
            <div className="text-xs text-center mt-2 text-red-500">
              {audioError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
