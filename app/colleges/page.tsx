"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { v4 as uuid } from "uuid";

import type { College } from "@/lib/models";
import { collegesDB } from "@/lib/colleges-db";

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestions = name.length < 2 ? [] : collegesDB.filter(c => c.name.toLowerCase().includes(name.toLowerCase())).slice(0, 10);

  const categoryFromPercent = (p?: number) => {
    if (typeof p !== "number") return undefined;
    if (p >= 80) return "Safety" as const;
    if (p >= 50) return "Target" as const;
    return "Reach" as const;
  };

  useEffect(() => {
    const saved = localStorage.getItem("colleges");
    if (saved) setColleges(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("colleges", JSON.stringify(colleges));
  }, [colleges]);

  const addCollege = () => {
    if (!name.trim()) return;
    setColleges((c) => [{ id: uuid(), name, city, state, percent: undefined }, ...c]);
    setName(""); setCity(""); setState("");
    setShowSuggest(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-4">
          <div className="font-semibold mb-2">Add College</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="relative sm:col-span-2">
              <input className="input w-full" placeholder="Name" value={name}
                onFocus={()=>setShowSuggest(true)}
                onChange={(e)=>{ setName(e.target.value); setShowSuggest(true); }} />
              {showSuggest && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-soft max-h-60 overflow-auto">
                  {suggestions.map((s, i)=> (
                    <li key={i} className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                      onMouseDown={()=>{ setName(s.name); setCity(s.city); setState(s.state); setShowSuggest(false); }}>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-600">{s.city}, {s.state}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input className="input" placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)} />
            <input className="input" placeholder="State" value={state} onChange={(e)=>setState(e.target.value)} />
          </div>
          <div className="mt-3"><button className="btn" onClick={addCollege}>Add</button></div>
        </div>

        <div className="card p-0">
          <div className="px-4 py-3 text-lg font-semibold">My Colleges</div>
          <ul>
            {colleges.map((c) => (
              <li key={c.id} className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <Link href={`/colleges/${c.id}`} className="text-lg font-medium hover:underline">{c.name}</Link>
                  <div className="text-sm text-gray-600">
                    {[c.city, c.state].filter(Boolean).join(", ")}
                    {typeof c.percent === 'number' && (
                      <> • {categoryFromPercent(c.percent)}</>
                    )}
                  </div>
                </div>
                {typeof c.percent === 'number' && (
                  <div className="text-brand-700 font-semibold">{c.percent}%</div>
                )}
              </li>
            ))}
            {colleges.length === 0 && (
              <div className="px-4 pb-6 text-sm text-gray-600">Add a college above to get started.</div>
            )}
          </ul>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="card p-4">
          <div className="font-semibold mb-2">Tips</div>
          <div className="text-sm text-gray-700">Click a college to answer its specific questions and see a realistic chance estimate.</div>
        </div>
      </div>
    </div>
  );
}
