"use client";
import { AutosaveInput, AutosaveTextArea } from "@/components/AutosaveField";
import { ChatbotPanel } from "@/components/ChatbotPanel";
import { useState } from "react";

export default function ApplicationPage() {
  const [essayFeedback, setEssayFeedback] = useState<string>("");

  const getFeedback = async () => {
    try {
      const essay = localStorage.getItem("app.essay.main") || "";
      const res = await fetch("/api/gemini/essay-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay })
      });
      const bodyText = await res.text();
      let data: any = {};
      try { data = bodyText ? JSON.parse(bodyText) : {}; } catch { data = {}; }
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setEssayFeedback(data.text || "No feedback returned.");
    } catch (e: any) {
      setEssayFeedback("I couldn't load feedback right now. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6">
          <div className="text-xl font-semibold mb-4">My Profile</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AutosaveInput storageKey="profile.majors" label="Interested Majors" placeholder="Computer Science, Economics" />
            <AutosaveInput storageKey="profile.interests" label="Personal Interests" placeholder="Robotics, Debate" />
            <AutosaveInput storageKey="profile.location" label="Location" placeholder="Seattle, WA" />
            <AutosaveInput storageKey="profile.school" label="Current School" placeholder="Roosevelt High School" />
            <AutosaveInput storageKey="profile.hobbies" label="Hobbies" placeholder="Photography, Hiking" />
            <AutosaveInput storageKey="profile.skills" label="Skills" placeholder="Python, Public Speaking" />
          </div>
        </div>

        <div className="card p-6">
          <div className="text-xl font-semibold mb-4">Common App Sections</div>
          <div className="grid grid-cols-1 gap-4">
            <AutosaveInput storageKey="app.gpa" label="GPA" placeholder="3.9 unweighted" />
            <AutosaveInput storageKey="app.sat" label="SAT / ACT" placeholder="1540 SAT" />
            <AutosaveTextArea storageKey="app.activities" label="Activities" placeholder="List your major activities and roles" />
            <AutosaveTextArea storageKey="app.honors" label="Honors" placeholder="List 3-5 honors" />
            <AutosaveTextArea storageKey="app.additional" label="Additional Information" placeholder="Anything else admissions should know" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-semibold">Common App Essay</div>
            <button onClick={getFeedback} className="btn">Get Feedback</button>
          </div>
          <AutosaveTextArea storageKey="app.essay.main" label="Essay Draft" rows={14} placeholder="Paste or write your essay here" />
          {essayFeedback && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm whitespace-pre-wrap">{essayFeedback}</div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <ChatbotPanel context={{ page: "application" }} />
      </div>
    </div>
  );
}
