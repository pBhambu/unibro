"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [customPersonality, setCustomPersonality] = useState("");

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedPersonality = localStorage.getItem("customPersonality") || "";
    setDarkMode(savedDarkMode);
    setCustomPersonality(savedPersonality);
    
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const savePersonality = () => {
    localStorage.setItem("customPersonality", customPersonality);
    alert("Personality saved! It will be applied to all AI responses.");
  };

  const resetPersonality = () => {
    setCustomPersonality("");
    localStorage.removeItem("customPersonality");
    alert("Personality reset to default.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-title">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your UniBro experience</p>
      </div>

      <div className="card p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 font-title">Appearance</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={24} className="text-green-600 dark:text-green-400" /> : <Sun size={24} className="text-green-600" />}
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toggle dark/light theme</div>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                darkMode ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  darkMode ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 font-title">AI Personality</h2>
          <div className="space-y-3">
            <label className="block">
              <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Personality Instructions
              </div>
              <textarea
                className="input min-h-[200px] font-mono text-sm"
                placeholder="Example: Be realistic and precise. Do not overly praise the user, but act like a real college counselor. Do not make your responses too long."
                value={customPersonality}
                onChange={(e) => setCustomPersonality(e.target.value)}
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This will override the default AI personality for all responses. Leave blank to use default.
              </div>
            </label>
            <div className="flex gap-2">
              <button onClick={savePersonality} className="btn">
                Save Personality
              </button>
              <button onClick={resetPersonality} className="btn-secondary">
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 font-title">About</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong className="text-gray-900 dark:text-gray-100">UniBro</strong> - Your AI-powered college application assistant</p>
          <p>Version 1.0.0</p>
          <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
            Built with Next.js, Tailwind CSS, Google Gemini AI, and ElevenLabs
          </p>
        </div>
      </div>
    </div>
  );
}
