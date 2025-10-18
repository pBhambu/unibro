"use client";
import { useEffect, useState } from "react";

function useAutosave(key: string, initial = "") {
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    setValue(saved ?? initial);
  }, [key, initial]);

  useEffect(() => {
    const id = setTimeout(() => {
      try { localStorage.setItem(key, value); } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [key, value]);

  return { value, setValue } as const;
}

export function AutosaveInput({ storageKey, label, placeholder }: { storageKey: string; label: string; placeholder?: string }) {
  const { value, setValue } = useAutosave(storageKey);
  return (
    <label className="block">
      <div className="mb-1 text-sm text-gray-600">{label}</div>
      <input className="input" value={value} placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}

export function AutosaveTextArea({ storageKey, label, placeholder, rows = 6 }: { storageKey: string; label: string; placeholder?: string; rows?: number }) {
  const { value, setValue } = useAutosave(storageKey);
  return (
    <label className="block">
      <div className="mb-1 text-sm text-gray-600">{label}</div>
      <textarea className="input min-h-[120px]" rows={rows} value={value} placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}
