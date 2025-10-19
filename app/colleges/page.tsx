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

  // Load colleges from localStorage on mount
  useEffect(() => {
    const loadColleges = () => {
      try {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem("colleges");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setColleges(parsed);
              return;
            }
          }
          // Initialize with empty array if no saved data
          localStorage.setItem("colleges", JSON.stringify([]));
        }
      } catch (error) {
        console.error("Error loading colleges:", error);
      }
    };

    // Load immediately
    loadColleges();

    // Also listen for storage events to sync across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'colleges' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setColleges(parsed);
          }
        } catch (error) {
          console.error("Error parsing storage event:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Save colleges to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && colleges.length > 0) {
      try {
        localStorage.setItem("colleges", JSON.stringify(colleges));
      } catch (error) {
        console.error("Error saving colleges:", error);
      }
    }
  }, [colleges]);

  // Load form state from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("colleges.form.name");
    const savedCity = localStorage.getItem("colleges.form.city");
    const savedState = localStorage.getItem("colleges.form.state");
    if (savedName) setName(savedName);
    if (savedCity) setCity(savedCity);
    if (savedState) setState(savedState);
  }, []);

  // Save form state to localStorage
  useEffect(() => { if (name) localStorage.setItem("colleges.form.name", name); }, [name]);
  useEffect(() => { if (city) localStorage.setItem("colleges.form.city", city); }, [city]);
  useEffect(() => { if (state) localStorage.setItem("colleges.form.state", state); }, [state]);

  const addCollege = () => {
    if (!name.trim()) return;
    const newCollege = { id: uuid(), name, city, state, percent: undefined };
    const updatedColleges = [newCollege, ...colleges];
    setColleges(updatedColleges);
    // Save to localStorage immediately
    localStorage.setItem("colleges", JSON.stringify(updatedColleges));
    
    // Reset form
    setName(""); 
    setCity(""); 
    setState("");
    setShowSuggest(false);
    
    // Clear form data from localStorage
    localStorage.removeItem("colleges.form.name");
    localStorage.removeItem("colleges.form.city");
    localStorage.removeItem("colleges.form.state");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-4 relative z-20">
          <div className="font-semibold mb-2">Add College</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="relative sm:col-span-2">
              <input className="input w-full" placeholder="Name" value={name}
                onFocus={()=>setShowSuggest(true)}
                onChange={(e)=>{ setName(e.target.value); setShowSuggest(true); }} />
              {showSuggest && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((s, i)=> (
                    <li key={i} className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-amber-900/20 cursor-pointer"
                      onMouseDown={()=>{ setName(s.name); setCity(s.city); setState(s.state); setShowSuggest(false); }}>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{s.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{s.city}, {s.state}</div>
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
            {colleges.map((c) => {
              const category = categoryFromPercent(c.percent);
              const badgeColors = {
                Safety: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
                Target: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
                Reach: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700'
              };
              return (
                <li key={c.id} className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Link href={`/colleges/${c.id}`} className="text-lg font-semibold hover:text-emerald-700 dark:hover:text-amber-400 transition font-title">{c.name}</Link>
                        {category && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${badgeColors[category]}`}>
                            {category}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {[c.city, c.state].filter(Boolean).join(", ")}
                      </div>
                    </div>
                    {typeof c.percent === 'number' && (
                      <div className="text-2xl font-bold text-emerald-700 dark:text-amber-400 ml-4">{c.percent}%</div>
                    )}
                  </div>
                </li>
              );
            })}
            {colleges.length === 0 && (
              <div className="px-4 pb-6 text-sm text-gray-600">Add a college above to get started.</div>
            )}
          </ul>
        </div>
      </div>

      {/* Right Column - Tips Section */}
      <div className="lg:col-span-1">
        <div className="card p-4 sticky top-6">
          <div className="font-semibold mb-2">Tips</div>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>• Click a college to answer its specific questions and see a realistic chance estimate.</p>
            <p>• Add your safety, target, and reach schools to build a balanced college list.</p>
            <p>• Use the chance estimator to get a realistic assessment of your admission odds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
