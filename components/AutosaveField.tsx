"use client";
import { useEffect, useState, useRef } from "react";

function useAutosave(key: string, initial = "") {
  const [value, setValue] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const initialLoadRef = useRef(true);
  
  // Load from localStorage on mount and when key changes
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    setValue(saved ?? initial);
    // Reset the initialLoadRef when key changes so we don't save immediately after loading
    initialLoadRef.current = true;
  }, [key]);

  // Listen for storage events to sync when localStorage is updated externally
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setValue(e.newValue);
        initialLoadRef.current = true; // Don't save immediately after external update
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

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

interface AutosaveInputProps {
  storageKey: string;
  label: string;
  placeholder?: string;
  className?: string;
  type?: string;
  min?: string | number;
  max?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AutosaveInput({ 
  storageKey, 
  label, 
  placeholder, 
  className = '',
  type = 'text',
  min,
  max,
  onChange
}: AutosaveInputProps) {
  const { value, setValue, saveStatus } = useAutosave(storageKey);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };
  
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/90 dark:bg-gray-800/90 focus:ring-2 focus:ring-[#31BD01] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {saveStatus === 'saving' && (
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {saveStatus === 'saved' && (
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
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
