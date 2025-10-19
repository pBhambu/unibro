"use client";
import { useEffect, useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";

type PlanItem = { id: string; date: string; action: string };

export default function PlanPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [planSummary, setPlanSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const abortRef = useRef<AbortController | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const initialLoadRef = useRef(true);

  useEffect(()=>{
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem("plan.startDate");
      const d = localStorage.getItem("plan.endDate");
      const p = localStorage.getItem("plan.items");
      const prompt = localStorage.getItem("plan.customPrompt");
      const summary = localStorage.getItem("plan.summary");
      console.log('Loading plan from localStorage:', { startDate: s, endDate: d, items: p });
      if (s) setStartDate(s);
      if (d) setEndDate(d);
      if (prompt) setCustomPrompt(prompt);
      if (summary) setPlanSummary(summary);
      if (p) {
        try {
          const parsed = JSON.parse(p);
          if (Array.isArray(parsed)) {
            console.log('Setting plan items:', parsed);
            setPlanItems(parsed);
          }
        } catch (e) {
          console.error('Error parsing plan items:', e);
        }
      }
    }
  },[]);

  useEffect(()=>{ 
    if(startDate) localStorage.setItem("plan.startDate", startDate); 
    else localStorage.removeItem("plan.startDate");
  },[startDate]);
  useEffect(()=>{ 
    if(endDate) localStorage.setItem("plan.endDate", endDate); 
    else localStorage.removeItem("plan.endDate");
  },[endDate]);
  useEffect(()=>{ 
    if(customPrompt) localStorage.setItem("plan.customPrompt", customPrompt); 
    else localStorage.removeItem("plan.customPrompt");
  },[customPrompt]);
  useEffect(()=>{ 
    if(planSummary) localStorage.setItem("plan.summary", planSummary); 
    else localStorage.removeItem("plan.summary");
  },[planSummary]);
  useEffect(()=>{ 
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    if (typeof window !== 'undefined') {
      setSaveStatus('saving');
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem("plan.items", JSON.stringify(planItems));
          console.log('Saved plan items to localStorage:', planItems);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 1500);
        } catch (e) {
          console.error('Error saving plan items:', e);
        }
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  },[planItems]);

  const generate = async () => {
    if (loading) return;
    const profile = {
      majors: localStorage.getItem("profile.majors"),
      extras: localStorage.getItem("profile.extras") || [
        localStorage.getItem("profile.interests"),
        localStorage.getItem("profile.hobbies"),
        localStorage.getItem("profile.skills"),
      ].filter(Boolean).join(", "),
      location: localStorage.getItem("profile.location"),
      activities: localStorage.getItem("app.activities"),
    };
    
    // Convert existing plan items to text format for AI to modify
    const existingPlan = planItems.length > 0 
      ? planItems.map(item => `${item.date}: ${item.action}`).join('\n')
      : null;
    
    try {
      setLoading(true);
      abortRef.current = new AbortController();
      const apiKey = localStorage.getItem('geminiApiKey');
      const res = await fetch("/api/gemini/plan", { 
        method: "POST", 
        headers: {"Content-Type":"application/json"}, 
        body: JSON.stringify({ 
          startDate, 
          endDate, 
          profile, 
          customPrompt: customPrompt.trim() || null,
          existingPlan,
          apiKey 
        }), 
        signal: abortRef.current.signal 
      });
      const txt = await res.text();
      let data: any = {};
      try { data = txt ? JSON.parse(txt) : {}; } catch { data = {}; }
      const planText = data.plan || "";
      const summary = data.summary || "";
      parsePlanText(planText);
      if (summary) setPlanSummary(summary);
      // Clear custom prompt after successful generation
      setCustomPrompt("");
    } catch (e: any) {
      // Preserve existing plan items on error (unless aborted)
      // No state clearing here to avoid losing saved plans
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const cancelGenerate = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      setLoading(false);
    }
  };

  const parsePlanText = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    const items: PlanItem[] = [];
    lines.forEach(line => {
      const match = line.match(/(\d{4}-\d{2}-\d{2})\s*:?\s*(.+)/);
      if (match) {
        items.push({ id: Math.random().toString(36).substr(2, 9), date: match[1], action: match[2].trim() });
      }
    });
    // Sort chronologically
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setPlanItems(items);
  };

  const addItem = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newItems = [...planItems, { id, date: '', action: '' }];
    // Sort chronologically
    newItems.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    setPlanItems(newItems);
    setLastAddedId(id);
  };

  const updateItem = (id: string, field: 'date' | 'action', value: string) => {
    const newItems = planItems.map(item => item.id === id ? { ...item, [field]: value } : item);
    // Sort chronologically after update
    newItems.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    setPlanItems(newItems);
  };

  const deleteItem = (id: string) => {
    setPlanItems(planItems.filter(item => item.id !== id));
  };

  // Expose setPlanItems globally for assistant
  useEffect(() => {
    (window as any).updatePlan = (newItems: PlanItem[]) => {
      setPlanItems(newItems);
    };
  }, []);

  useEffect(() => {
    if (lastAddedId) {
      const el = rowRefs.current[lastAddedId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setLastAddedId(null);
      }
    }
  }, [planItems, lastAddedId]);

  const formatDate = (d: string) => {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100 font-title">My Plan</div>
            {saveStatus !== 'idle' && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
            <label className="block">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Start Date</div>
              <input type="date" className="input" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
            </label>
            <label className="block">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">End Date</div>
              <input type="date" className="input" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
            </label>
            <div className="flex gap-2 flex-wrap">
              {loading && <button onClick={cancelGenerate} className="btn bg-red-600 hover:bg-red-700 whitespace-nowrap">Cancel</button>}
              <button className="btn disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap" onClick={generate} disabled={loading}>
                {loading ? "Generating..." : "Generate Plan"}
              </button>
            </div>
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600 dark:text-gray-400">
                Custom Instructions (Optional)
              </label>
              <textarea
                className="input w-full min-h-[80px] resize-y"
                placeholder="e.g., 'I need summer 2026 off', 'Include local opportunities in Seattle', 'Focus on research projects'..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {planItems.length > 0 
                  ? 'AI will modify your existing plan based on these instructions' 
                  : 'AI will create a new plan with these instructions'}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 font-title">Timeline</div>
            <button onClick={addItem} className="btn-secondary flex items-center gap-2">
              <Plus size={16} /> Add Item
            </button>
          </div>
          {planItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {planItems.map((item) => (
                    <tr
                      key={item.id}
                      ref={(el) => { rowRefs.current[item.id] = el; }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-2 align-top">
                        {editingId === item.id ? (
                          <input
                            type="date"
                            className="input py-1.5 text-sm w-full"
                            value={item.date}
                            onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatDate(item.date)}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 w-full">
                        {editingId === item.id ? (
                          <textarea
                            className="input py-1.5 text-sm min-h-[6rem] resize-y w-full"
                            placeholder="Enter action..."
                            value={item.action}
                            onChange={(e) => updateItem(item.id, 'action', e.target.value)}
                            rows={3}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = target.scrollHeight + 'px';
                            }}
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap" 
                            dangerouslySetInnerHTML={{ 
                              __html: (item.action || '-')
                                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                            }}
                          ></div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-top space-x-2 whitespace-nowrap">
                        {editingId === item.id ? (
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-emerald-600 hover:text-emerald-700 dark:text-amber-400 dark:hover:text-amber-300 mr-2"
                          >
                            Done
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingId(item.id)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 mr-2"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              Click "Add Item" or "Generate Plan" to get started
            </div>
          )}
        </div>

        {planSummary && (
          <div className="card p-6">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 font-title mb-3">Plan Summary</div>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ 
                __html: planSummary
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br/>') 
              }} 
            />
          </div>
        )}
      </div>

      {/* Chat functionality is now handled by the global CounselorBro component */}
    </div>
  );
}
