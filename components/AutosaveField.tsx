"use client";
import { useEffect, useState, useRef } from "react";

function useAutosave(key: string, initial = "") {
  const [value, setValue] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const initialLoadRef = useRef(true);
  
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    setValue(saved ?? initial);
  }, [key, initial]);

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    setSaveStatus('saving');
    const id = setTimeout(() => {
      try { 
        localStorage.setItem(key, value); 
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [key, value]);

  return { value, setValue, saveStatus } as const;
}

export function AutosaveInput({ storageKey, label, placeholder }: { storageKey: string; label: string; placeholder?: string }) {
  const { value, setValue, saveStatus } = useAutosave(storageKey);
  return (
    <label className="block">
      <div className="mb-1 text-sm text-gray-600 flex items-center gap-2">
        <span>{label}</span>
        {saveStatus === 'saving' && <span className="text-xs text-gray-400">saving...</span>}
        {saveStatus === 'saved' && <span className="text-xs text-green-600">✓ saved</span>}
      </div>
      <input className="input" value={value} placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}

export function AutosaveTextArea({ storageKey, label, placeholder, rows = 6 }: { storageKey: string; label: string; placeholder?: string; rows?: number }) {
  const { value, setValue, saveStatus } = useAutosave(storageKey);
  return (
    <label className="block">
      <div className="mb-1 text-sm text-gray-600 flex items-center gap-2">
        <span>{label}</span>
        {saveStatus === 'saving' && <span className="text-xs text-gray-400">saving...</span>}
        {saveStatus === 'saved' && <span className="text-xs text-green-600">✓ saved</span>}
      </div>
      <textarea className="input min-h-[120px]" rows={rows} value={value} placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}
