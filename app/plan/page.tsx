"use client";
import { useEffect, useState, useRef } from "react";
import { ChatbotPanel } from "@/components/ChatbotPanel";
import { Plus, Trash2 } from "lucide-react";

type PlanItem = { id: string; date: string; action: string };

export default function PlanPage() {
  const [endDate, setEndDate] = useState<string>("");
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(()=>{
    const d = localStorage.getItem("plan.endDate");
    const p = localStorage.getItem("plan.items");
    if (d) setEndDate(d);
    if (p) {
      try {
        setPlanItems(JSON.parse(p));
      } catch {}
    }
  },[]);

  useEffect(()=>{ if(endDate) localStorage.setItem("plan.endDate", endDate); },[endDate]);
  useEffect(()=>{ localStorage.setItem("plan.items", JSON.stringify(planItems)); },[planItems]);

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
    try {
      setLoading(true);
      abortRef.current = new AbortController();
      const res = await fetch("/api/gemini/plan", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ endDate, profile }), signal: abortRef.current.signal });
      const txt = await res.text();
      let data: any = {};
      try { data = txt ? JSON.parse(txt) : {}; } catch { data = {}; }
      const planText = data.plan || "";
      parsePlanText(planText);
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
    setPlanItems(items);
  };

  const addItem = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setPlanItems([...planItems, { id, date: '', action: '' }]);
    setLastAddedId(id);
  };

  const updateItem = (id: string, field: 'date' | 'action', value: string) => {
    setPlanItems(planItems.map(item => item.id === id ? { ...item, [field]: value } : item));
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
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100 font-title">My Plan</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
            <label className="block sm:col-span-2">
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {planItems.map((item) => (
                    <tr
                      key={item.id}
                      ref={(el) => { rowRefs.current[item.id] = el; }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4 align-top">
                        {editingId === item.id ? (
                          <input
                            type="date"
                            className="input py-1.5 text-sm"
                            value={item.date}
                            onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(item.date)}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 w-full">
                        {editingId === item.id ? (
                          <textarea
                            className="input py-1.5 text-sm min-h-[2.5rem] resize-y"
                            placeholder="Enter action..."
                            value={item.action}
                            onChange={(e) => updateItem(item.id, 'action', e.target.value)}
                            rows={1}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = target.scrollHeight + 'px';
                            }}
                          />
                        ) : (
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.action || '-'}</div>
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
      </div>

      <div className="lg:col-span-1">
        <ChatbotPanel context={{ page: "plan", planItems }} />
      </div>
    </div>
  );
}
