"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { v4 as uuid } from "uuid";

import type { College } from "@/lib/models";

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-4">
          <div className="font-semibold mb-2">Add College</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input className="input sm:col-span-2" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
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
