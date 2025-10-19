"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import { createPortal } from 'react-dom';

import type { College } from "@/lib/models";
import { collegesDB } from "@/lib/colleges-db";
import { CollegeLogo } from "@/components/CollegeLogo";

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const suggestions = name.length < 2 ? [] : collegesDB.filter(c => c.name.toLowerCase().includes(name.toLowerCase())).slice(0, 10);
  
  // Calculate dropdown position
  useEffect(() => {
    if (showSuggest && inputRef.current) {
      const updatePosition = () => {
        const rect = inputRef.current?.getBoundingClientRect();
        if (rect) {
          setDropdownPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
          });
        }
      };
      
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [showSuggest, name]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggest(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    console.log('Adding college with id:', uuid(), 'name:', name);
    const newCollege = { id: uuid(), name, city, state, percent: undefined };
    const updatedColleges = [newCollege, ...colleges];
    setColleges(updatedColleges);
    // Save to localStorage immediately
    localStorage.setItem("colleges", JSON.stringify(updatedColleges));
    console.log('Saved colleges:', updatedColleges);
    
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

  const deleteCollege = (id: string) => {
    if (!confirm("Delete this college? All associated data will be lost.")) return;
    
    // Remove from list
    const updatedColleges = colleges.filter(c => c.id !== id);
    setColleges(updatedColleges);
    localStorage.setItem("colleges", JSON.stringify(updatedColleges));
    
    // Clean up all college-specific data
    const keysToRemove = [
      `college.${id}.fields`,
      `college.${id}.answers`,
      `college.${id}.prompt`,
      `college.${id}.commonAppUse`,
      `college.${id}.percent`
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const startEditingName = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const saveEditedName = (id: string) => {
    if (!editingName.trim() || editingName.trim() === colleges.find(c => c.id === id)?.name) {
      setEditingId(null);
      return;
    }
    
    const updatedColleges = colleges.map(c => 
      c.id === id ? { ...c, name: editingName.trim() } : c
    );
    setColleges(updatedColleges);
    localStorage.setItem("colleges", JSON.stringify(updatedColleges));
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative z-20">
          <div className="card p-4">
            <div className="font-semibold mb-2">Add College</div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  ref={inputRef}
                  className="input w-full" 
                  placeholder="College Name" 
                  value={name}
                  onFocus={() => setShowSuggest(true)}
                  onChange={(e) => { 
                    setName(e.target.value); 
                    setShowSuggest(true); 
                  }} 
                />
                {showSuggest && suggestions.length > 0 && createPortal(
                  <div 
                    ref={dropdownRef}
                    className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${Math.max(dropdownPosition.width, 300)}px`
                    }}
                  >
                    {suggestions.map((s, index) => (
                      <div
                        key={`${s.name}-${s.city}-${s.state}-${index}`}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                        onClick={() => {
                          setName(s.name);
                          setCity(s.city);
                          setState(s.state);
                          setShowSuggest(false);
                        }}
                      >
                        <CollegeLogo name={s.name} className="w-6 h-6 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{s.city}, {s.state}</div>
                        </div>
                      </div>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
              <button className="btn whitespace-nowrap" onClick={addCollege}>Add College</button>
            </div>
          </div>
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
                <li key={c.id} className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition first:rounded-t-lg last:rounded-b-lg group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <CollegeLogo name={c.name} website={c.website} size="md" />
                      <div className="flex-1 min-w-0">
                        {editingId === c.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="input py-1 text-sm flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditedName(c.id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                            />
                            <button onClick={() => saveEditedName(c.id)} className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition">Save</button>
                            <button onClick={cancelEditing} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">Cancel</button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Link 
                                href={`/colleges/${c.id}`} 
                                className="text-lg font-semibold hover:text-emerald-700 dark:hover:text-amber-400 transition font-title truncate"
                                onClick={() => console.log('Navigating to college:', c.id, c.name)}
                              >
                                {c.name}
                              </Link>
                              {category && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${badgeColors[category]}`}>
                                  {category}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {[c.city, c.state].filter(Boolean).join(", ")}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {typeof c.percent === 'number' && category && (
                        <div className={`text-2xl font-bold ${
                          category === 'Safety' ? 'text-emerald-700 dark:text-emerald-400' :
                          category === 'Target' ? 'text-blue-700 dark:text-blue-400' :
                          'text-amber-700 dark:text-amber-400'
                        }`}>{c.percent}%</div>
                      )}
                      {editingId !== c.id && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.preventDefault(); startEditingName(c.id, c.name); }}
                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
                            title="Edit name"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => { e.preventDefault(); deleteCollege(c.id); }}
                            className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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
      </div>
    </div>
  );
}
