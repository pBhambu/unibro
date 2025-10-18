"use client";
import { AutosaveInput, AutosaveTextArea } from "@/components/AutosaveField";
import { ChatbotPanel } from "@/components/ChatbotPanel";
import { useState, useRef } from "react";

export default function ApplicationPage() {
  const [essayFeedback, setEssayFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const getFeedback = async () => {
    if (loading) return;
    try {
      setLoading(true);
      abortRef.current = new AbortController();
      const essay = localStorage.getItem("app.essay.main") || "";
      const res = await fetch("/api/gemini/essay-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay }),
        signal: abortRef.current.signal
      });
      const bodyText = await res.text();
      let data: any = {};
      try { data = bodyText ? JSON.parse(bodyText) : {}; } catch { data = {}; }
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setEssayFeedback(data.text || "No feedback returned.");
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setEssayFeedback("I couldn't load feedback right now. Please try again.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const cancelFeedback = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6">
          <div className="text-xl font-semibold mb-4">My Profile</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AutosaveInput storageKey="profile.majors" label="Interested Majors" placeholder="Computer Science, Economics" />
            <AutosaveInput storageKey="profile.location" label="Location" placeholder="Seattle, WA" />
            <AutosaveInput storageKey="profile.school" label="Current School" placeholder="Roosevelt High School" />
            <AutosaveTextArea storageKey="profile.extras" label="Interests, hobbies, skills" placeholder="Robotics; Debate; Photography; Hiking; Python; Public Speaking" rows={6} />
          </div>
        </div>

        <div className="card p-6">
          <div className="text-xl font-semibold mb-4">Common App Sections</div>
          <div className="grid grid-cols-1 gap-4">
            <AutosaveInput storageKey="app.gpa" label="GPA" placeholder="3.9 unweighted" />
            <AutosaveInput storageKey="app.sat" label="SAT / ACT" placeholder="1540 SAT" />
            <AutosaveTextArea storageKey="app.ap" label="AP Tests" placeholder="AP Calculus BC (5), AP Physics C (5), AP Computer Science A (5)" rows={3} />
            <AutosaveTextArea storageKey="app.activities" label="Activities" placeholder="List your major activities and roles" />
            <AutosaveTextArea storageKey="app.honors" label="Honors" placeholder="List 3-5 honors" />
            <AutosaveTextArea storageKey="app.additional" label="Additional Information" placeholder="Anything else admissions should know" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-semibold">Common App Essay</div>
            <div className="flex gap-2">
              {loading && <button onClick={cancelFeedback} className="btn bg-red-600 hover:bg-red-700">Cancel</button>}
              <button onClick={getFeedback} disabled={loading} className="btn disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Generating..." : "Get Feedback"}
              </button>
            </div>
          </div>
          <AutosaveTextArea storageKey="app.essay.main" label="Essay Draft" rows={14} placeholder="Paste or write your essay here" />
          {essayFeedback && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: essayFeedback.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>') }} />
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <ChatbotPanel context={{ page: "application" }} />
      </div>
    </div>
  );
}
