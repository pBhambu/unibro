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
      if (e.name !== 'AbortError') {
        setPlanItems([]);
      }
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
    setPlanItems([...planItems, { id: Math.random().toString(36).substr(2, 9), date: '', action: '' }]);
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
            <div className="flex gap-2">
              {loading && <button onClick={cancelGenerate} className="btn bg-red-600 hover:bg-red-700">Cancel</button>}
              <button className="btn disabled:opacity-50 disabled:cursor-not-allowed" onClick={generate} disabled={loading}>
                {loading ? "Generating..." : "Generate Plan"}
              </button>
            </div>
          </div>
        </div>

        {planItems.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 font-title">Timeline</div>
              <button onClick={addItem} className="btn-secondary flex items-center gap-2">
                <Plus size={16} /> Add Item
              </button>
            </div>
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
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          className="input py-1.5 text-sm"
                          value={item.date}
                          onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          className="input py-1.5 text-sm"
                          placeholder="Enter action..."
                          value={item.action}
                          onChange={(e) => updateItem(item.id, 'action', e.target.value)}
                        />
                      </td>
                      <td className="py-3 px-4">
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
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <ChatbotPanel context={{ page: "plan", planItems }} />
      </div>
    </div>
  );
}
