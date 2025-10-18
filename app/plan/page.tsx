"use client";
import { useEffect, useState } from "react";
import { ChatbotPanel } from "@/components/ChatbotPanel";

export default function PlanPage() {
  const [endDate, setEndDate] = useState<string>("");
  const [plan, setPlan] = useState<string>("");

  useEffect(()=>{
    const d = localStorage.getItem("plan.endDate");
    const p = localStorage.getItem("plan.table");
    if (d) setEndDate(d);
    if (p) setPlan(p);
  },[]);

  useEffect(()=>{ if(endDate) localStorage.setItem("plan.endDate", endDate); },[endDate]);
  useEffect(()=>{ localStorage.setItem("plan.table", plan); },[plan]);

  const generate = async () => {
    const profile = {
      majors: localStorage.getItem("profile.majors"),
      interests: localStorage.getItem("profile.interests"),
      location: localStorage.getItem("profile.location"),
      skills: localStorage.getItem("profile.skills"),
      activities: localStorage.getItem("app.activities"),
    };
    const res = await fetch("/api/gemini/plan", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ endDate, profile })});
    const data = await res.json();
    setPlan(data.plan);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6 space-y-3">
          <div className="text-xl font-semibold">My Plan</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
            <label className="block sm:col-span-2">
              <div className="mb-1 text-sm text-gray-600">End Date</div>
              <input type="date" className="input" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
            </label>
            <button className="btn" onClick={generate}>Generate Plan</button>
          </div>
        </div>

        {plan && (
          <div className="card p-6">
            <div className="text-lg font-semibold mb-2">Timeline</div>
            <pre className="whitespace-pre-wrap text-sm">{plan}</pre>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <ChatbotPanel context={{ page: "plan", plan }} />
      </div>
    </div>
  );
}
