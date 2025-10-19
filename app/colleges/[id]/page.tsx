"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { ChatbotPanel } from "@/components/ChatbotPanel";

export default function CollegeEditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [fields, setFields] = useState<{ id: string; label: string; type: "text" | "textarea" | "select"; optional?: boolean; options?: string[] }[]>([]);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [percent, setPercent] = useState<number | null>(null);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingChance, setLoadingChance] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const abortFieldsRef = useRef<AbortController | null>(null);
  const abortChanceRef = useRef<AbortController | null>(null);
  const [commonAppUse, setCommonAppUse] = useState({
    gpa: true,
    sat: true,
    ap: true,
    activities: true,
    honors: true,
    additional: true,
    essay: true,
  });
  const categoryFromPercent = (p?: number | null) => {
    if (typeof p !== "number") return undefined;
    if (p >= 80) return "Safety" as const;
    if (p >= 50) return "Target" as const;
    return "Reach" as const;
  };

  // Load all college data from localStorage on mount
  useEffect(() => {
    const loadCollegeData = () => {
      if (typeof window === 'undefined') return;
      
      try {
        console.log(`Loading data for college ${id}`);
        
        // Load college name from the main colleges list
        const list = JSON.parse(localStorage.getItem("colleges") || "[]");
        const college = list.find((x: any) => x.id === id);
        if (college) {
          setName(college.name);
          // Update the college object in the list if it has a percent but not in the list
          if (college.percent !== undefined) {
            setPercent(college.percent);
          }
        }

        // Load all other college-specific data
        const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
          try {
            const saved = localStorage.getItem(`college.${id}.${key}`);
            if (!saved) {
              console.log(`No saved data for ${key}, using default`);
              return defaultValue;
            }
            // Special handling for prompt (stored as plain string, not JSON)
            if (key === 'prompt') return saved as T;
            const parsed = JSON.parse(saved);
            console.log(`Loaded ${key}:`, parsed);
            return parsed;
          } catch (e) {
            console.error(`Error loading ${key}:`, e);
            return defaultValue;
          }
        };

        const loadedFields = loadFromStorage('fields', []);
        const loadedAnswers = loadFromStorage('answers', {});
        
        console.log(`Setting fields:`, loadedFields);
        console.log(`Setting answers:`, loadedAnswers);
        
        setFields(loadedFields);
        setAnswers(loadedAnswers);
        
        const savedPrompt = localStorage.getItem(`college.${id}.prompt`);
        if (savedPrompt) setPrompt(savedPrompt);
        
        setCommonAppUse(loadFromStorage('commonAppUse', {
          gpa: true, sat: true, ap: true, activities: true, 
          honors: true, additional: true, essay: true
        }));
        
        const savedPercent = localStorage.getItem(`college.${id}.percent`);
        if (savedPercent) setPercent(parseInt(savedPercent));
        
        // Mark data as loaded
        setDataLoaded(true);

      } catch (error) {
        console.error("Error loading college data:", error);
        setDataLoaded(true);
      }
    };

    // Reset dataLoaded when ID changes
    setDataLoaded(false);
    
    // Load data immediately
    loadCollegeData();

    // Listen for storage events to sync across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `college.${id}.fields` && e.newValue) {
        try { setFields(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === `college.${id}.answers` && e.newValue) {
        try { setAnswers(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === `college.${id}.prompt` && e.newValue !== null) {
        setPrompt(e.newValue);
      } else if (e.key === `college.${id}.commonAppUse` && e.newValue) {
        try { setCommonAppUse(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === 'colleges' && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          const college = list.find((x: any) => x.id === id);
          if (college) {
            setName(college.name);
            if (college.percent !== undefined) {
              setPercent(college.percent);
            }
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [id]);

  // Save data to localStorage when it changes
  const saveToStorage = useCallback((key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = `college.${id}.${key}`;
      localStorage.setItem(storageKey, JSON.stringify(value));
      // Note: Browser automatically fires storage events to OTHER tabs
      // We don't dispatch manually to avoid infinite loops in the same tab
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }, [id]);

  // Save fields when they change (but only after initial data load)
  useEffect(() => { 
    if (dataLoaded && (fields.length > 0 || Object.keys(answers).length > 0)) {
      console.log('Saving fields:', fields);
      saveToStorage('fields', fields); 
    }
  }, [id, fields, saveToStorage, answers, dataLoaded]);
  
  // Save answers when they change (but only after initial data load)
  useEffect(() => { 
    if (dataLoaded && (Object.keys(answers).length > 0 || fields.length > 0)) {
      console.log('Saving answers:', answers);
      saveToStorage('answers', answers); 
    }
  }, [id, answers, saveToStorage, fields, dataLoaded]);
  
  // Save prompt when it changes
  useEffect(() => { 
    if (typeof window !== 'undefined') {
      localStorage.setItem(`college.${id}.prompt`, prompt);
      // Browser automatically fires storage events to OTHER tabs
    }
  }, [id, prompt]);
  
  // Save common app settings when they change
  useEffect(() => { saveToStorage('commonAppUse', commonAppUse); }, [id, commonAppUse, saveToStorage]);
  
  // Save percent to both the college object and its own key
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Save to dedicated percent key
    if (percent !== null) {
      localStorage.setItem(`college.${id}.percent`, String(percent));
    }
    
    // Also update the college in the main list
    try {
      const list = JSON.parse(localStorage.getItem("colleges") || "[]");
      const idx = list.findIndex((x: any) => x.id === id);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = { ...updated[idx], percent };
        localStorage.setItem("colleges", JSON.stringify(updated));
        // Browser automatically fires storage events to OTHER tabs
      }
    } catch (error) {
      console.error("Error updating college percent:", error);
    }
  }, [id, percent]);

  const generate = async () => {
    if (loadingFields) return;
    try {
      setLoadingFields(true);
      abortFieldsRef.current = new AbortController();
      const apiKey = localStorage.getItem('geminiApiKey') || undefined;
      
      const res = await fetch("/api/gemini/questions", { 
        method: "POST", 
        headers: {"Content-Type":"application/json"}, 
        body: JSON.stringify({ prompt, apiKey }), 
        signal: abortFieldsRef.current.signal 
      });
      
      const txt = await res.text();
      let data: any = {};
      try { data = txt ? JSON.parse(txt) : {}; } catch { data = {}; }
      if (!res.ok) throw new Error(data?.error || `Failed (${res.status})`);
      
      const generatedFields = Array.isArray(data.fields) ? data.fields : [];
      
      // Parse answers from the prompt if possible (only if there's actual content after the question)
      const newAnswers: Record<string,string> = {};
      generatedFields.forEach((f: any) => {
        const labelEscaped = f.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Only try to extract answers if the prompt contains the label followed by a colon or newline and substantial text
        // Pattern: "Label: <answer text>" or "Label\n<answer text that's clearly an answer, not another question>"
        const patterns = [
          // Match "Label: <text>" where text is substantial and doesn't look like another question
          new RegExp(labelEscaped + '\\s*:\\s*([^\\n]{50,1000})', 'i'),
          // Match "Label\n<paragraph>" where paragraph is 100+ chars and doesn't start with common question words
          new RegExp(labelEscaped + '\\s*\\n\\s*(?![Ww]hy|[Hh]ow|[Ww]hat|[Dd]escribe|[Ee]xplain|[Dd]iscuss)([^\\n]{100,1000})', 'i'),
        ];
        
        for (const pattern of patterns) {
          const match = prompt.match(pattern);
          if (match && match[1]) {
            const potentialAnswer = match[1].trim();
            // Only use it if it's substantial and doesn't look like another field label
            if (potentialAnswer.length > 50 && 
                !potentialAnswer.toLowerCase().includes('essay') &&
                !potentialAnswer.toLowerCase().includes('statement') &&
                !potentialAnswer.toLowerCase().includes('information')) {
              newAnswers[f.id] = potentialAnswer.replace(/^[:\-\s]+/, '');
              break;
            }
          }
        }
      });
      
      // Update state - useEffect hooks will handle saving to localStorage
      setFields(generatedFields);
      setAnswers(newAnswers);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setFields([]);
      }
    } finally {
      setLoadingFields(false);
      abortFieldsRef.current = null;
    }
  };

  const cancelGenerate = () => {
    if (abortFieldsRef.current) {
      abortFieldsRef.current.abort();
      setLoadingFields(false);
    }
  };

  const estimate = async () => {
    if (loadingChance) return;
    const profile = {
      gpa: commonAppUse.gpa ? localStorage.getItem("app.gpa") : null,
      sat: commonAppUse.sat ? localStorage.getItem("app.sat") : null,
      ap: commonAppUse.ap ? localStorage.getItem("app.ap") : null,
      activities: commonAppUse.activities ? localStorage.getItem("app.activities") : null,
      honors: commonAppUse.honors ? localStorage.getItem("app.honors") : null,
      additional: commonAppUse.additional ? localStorage.getItem("app.additional") : null,
      essay: commonAppUse.essay ? localStorage.getItem("app.essay.main") : null,
      majors: localStorage.getItem("profile.majors"),
      extras: localStorage.getItem("profile.extras") || [
        localStorage.getItem("profile.interests"),
        localStorage.getItem("profile.hobbies"),
        localStorage.getItem("profile.skills"),
      ].filter(Boolean).join(", "),
      location: localStorage.getItem("profile.location"),
      school: localStorage.getItem("profile.school"),
    };
    try {
      setLoadingChance(true);
      abortChanceRef.current = new AbortController();
      const res = await fetch("/api/gemini/chance", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ college: name, answers, profile }), signal: abortChanceRef.current.signal });
      const txt = await res.text();
      let data: any = {};
      try { data = txt ? JSON.parse(txt) : {}; } catch { data = {}; }
      if (!res.ok) throw new Error(data?.error || `Failed (${res.status})`);
      const pct = typeof data.percent === 'number' ? data.percent : null;
      if (pct !== null) {
        setPercent(pct);
        localStorage.setItem(`college.${id}.percent`, String(pct));
        const list = JSON.parse(localStorage.getItem("colleges")||"[]");
        const idx = list.findIndex((x: any)=>x.id===id);
        if (idx>=0) { list[idx].percent = pct; localStorage.setItem("colleges", JSON.stringify(list)); }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        // no-op, keep prior percent
      }
    } finally {
      setLoadingChance(false);
      abortChanceRef.current = null;
    }
  };

  const cancelEstimate = () => {
    if (abortChanceRef.current) {
      abortChanceRef.current.abort();
      setLoadingChance(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6 sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">{name || "College"}</div>
            {typeof percent === 'number' && (
              <div className="badge">{percent}% • {categoryFromPercent(percent)}</div>
            )}
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <div className="font-semibold">Common App Elements Used</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {Object.entries(commonAppUse).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={val} onChange={(e)=>setCommonAppUse(c=>({...c,[key]:e.target.checked}))} className="rounded" />
                <span className="capitalize">{key}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <div className="font-semibold">Upload PDF or Paste Questions</div>
          <input type="file" accept=".pdf" className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 dark:file:bg-amber-900/30 file:text-emerald-800 dark:file:text-amber-300 hover:file:bg-emerald-200 dark:hover:file:bg-amber-900/50 file:cursor-pointer" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setLoadingFields(true);
            const formData = new FormData();
            formData.append('file', file);
            const apiKey = localStorage.getItem('geminiApiKey');
            if (apiKey) formData.append('apiKey', apiKey);
            try {
              const res = await fetch('/api/gemini/questions-pdf', { method: 'POST', body: formData });
              const data = await res.json();
              if (data.fields) {
                // Update state - useEffect hooks will handle saving to localStorage
                setFields(data.fields);
                setAnswers({});
              } else {
                alert('Failed to parse PDF: ' + (data.error || 'Unknown error'));
              }
            } catch (err) { 
              alert('Failed to parse PDF'); 
            } finally {
              setLoadingFields(false);
            }
          }} />
          <div className="text-xs text-gray-500">Or paste text below:</div>
          <textarea className="input min-h-[120px]" placeholder="Paste all the college's questions (including any existing answers)..." value={prompt} onChange={(e)=>setPrompt(e.target.value)} />
          <div className="flex gap-2">
            {loadingFields && <button onClick={cancelGenerate} className="btn bg-red-600 hover:bg-red-700">Cancel</button>}
            <button className="btn disabled:opacity-50 disabled:cursor-not-allowed" onClick={generate} disabled={loadingFields}>
              {loadingFields ? "Generating..." : "Create Inputs"}
            </button>
          </div>
        </div>

        {fields.length>0 && (
          <div className="card p-6 space-y-4">
            <div className="text-lg font-semibold">Questions</div>
            {fields.map((f) => (
              <label key={f.id} className="block">
                <div className="mb-1 text-sm text-gray-600">
                  {f.label}
                  {f.optional && <span className="ml-1 text-xs text-gray-400">(optional)</span>}
                </div>
                {f.type === 'select' ? (
                  <select className="input" value={answers[f.id]||""} onChange={(e)=>setAnswers(a=>({...a,[f.id]: e.target.value}))}>
                    <option value="">Select...</option>
                    {(f.options || []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : f.type === 'text' ? (
                  <input className="input" value={answers[f.id]||""} onChange={(e)=>setAnswers(a=>({...a,[f.id]: e.target.value}))} />
                ) : (
                  <textarea className="input min-h-[100px]" value={answers[f.id]||""} onChange={(e)=>setAnswers(a=>({...a,[f.id]: e.target.value}))} />
                )}
              </label>
            ))}
            <div className="flex gap-2">
              {loadingChance && <button onClick={cancelEstimate} className="btn bg-red-600 hover:bg-red-700">Cancel</button>}
              <button className="btn disabled:opacity-50 disabled:cursor-not-allowed" onClick={estimate} disabled={loadingChance}>
                {loadingChance ? "Estimating..." : "Estimate Chance"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <ChatbotPanel context={{ page: "college", college: name, answers }} />
      </div>
    </div>
  );
}
