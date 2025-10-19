"use client";
import { AutosaveInput, AutosaveTextArea } from "@/components/AutosaveField";
import { useState, useRef, useEffect } from "react";

export default function ApplicationPage() {
  const [essayFeedback, setEssayFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  
  // SAT score states
  const [satMath, setSatMath] = useState("");
  const [satReading, setSatReading] = useState("");
  const [satTotal, setSatTotal] = useState("");
  const feedbackRef = useRef<HTMLDivElement>(null);
  
  // Load scores and essay feedback from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSatMath(localStorage.getItem('app.sat.math') || '');
      setSatReading(localStorage.getItem('app.sat.reading') || '');
      const savedFeedback = localStorage.getItem('app.essay.feedback');
      if (savedFeedback) {
        setEssayFeedback(savedFeedback);
      }
    }
  }, []);
  
  // Calculate SAT total
  useEffect(() => {
    const math = parseInt(satMath) || 0;
    const reading = parseInt(satReading) || 0;
    if (math > 0 || reading > 0) {
      const total = math + reading;
      setSatTotal(total.toString());
      localStorage.setItem('app.sat.total', total.toString());
    } else {
      setSatTotal('');
      localStorage.removeItem('app.sat.total');
    }
  }, [satMath, satReading]);

  const getFeedback = async () => {
    if (loading) return;
    try {
      setLoading(true);
      abortRef.current = new AbortController();
      const essay = localStorage.getItem("app.essay.main") || "";
      const apiKey = localStorage.getItem("geminiApiKey");
      const res = await fetch("/api/gemini/essay-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, apiKey }),
        signal: abortRef.current.signal
      });
      const bodyText = await res.text();
      let data: any = {};
      try { data = bodyText ? JSON.parse(bodyText) : {}; } catch { data = {}; }
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      const feedback = data.text || "No feedback returned.";
      setEssayFeedback(feedback);
      localStorage.setItem('app.essay.feedback', feedback);
      // Scroll to feedback after a short delay to ensure it's rendered
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
    <div className="container mx-auto px-4 py-8">
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
            <div>
              <div className="font-semibold mb-3">SAT Scores</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SAT Reading/Writing</label>
                  <AutosaveInput
                    storageKey="app.sat.reading"
                    label=""
                    placeholder="Score"
                    className="h-12"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSatReading(e.target.value);
                    }}
                  />
                </div>
                <div className="card p-4 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SAT Math</label>
                  <AutosaveInput
                    storageKey="app.sat.math"
                    label=""
                    placeholder="Score"
                    className="h-12"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSatMath(e.target.value);
                    }}
                  />
                </div>
                <div className="card p-4 flex flex-col">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">SAT Total</label>
                  <div className="w-full h-12 flex items-center px-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300 text-lg font-medium">{satTotal || '—'}</span>
                  </div>
                </div>
            </div>
            <div>
              <div className="font-semibold mb-3">ACT Scores</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AutosaveInput storageKey="app.act.composite" label="ACT Composite" placeholder="35" />
              </div>
            </div>
            <AutosaveTextArea storageKey="education.ap" label="AP Tests" placeholder="AP Calculus BC (5), AP Physics C (5), AP Computer Science A (5)" rows={3} />
            <AutosaveTextArea storageKey="education.activities" label="Activities" placeholder="List your major activities and roles" />
            <AutosaveTextArea storageKey="education.honors" label="Honors" placeholder="List 3-5 honors" />
            <AutosaveTextArea storageKey="education.additional" label="Additional Information" placeholder="Anything else admissions should know" />
          </div>
        </div>

        <div className="card p-6">
          <div className="text-xl font-semibold mb-4">Education</div>
          <div className="space-y-6">
            <div>
              <div className="font-semibold mb-3">Current or Most Recent Secondary/High School</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AutosaveInput storageKey="education.current.school" label="School Name" placeholder="Roosevelt High School" />
                <AutosaveInput storageKey="education.current.city" label="City" placeholder="Seattle" />
                <AutosaveInput storageKey="education.current.state" label="State" placeholder="WA" />
                <AutosaveInput storageKey="education.current.country" label="Country" placeholder="United States" />
                <AutosaveInput storageKey="education.current.startDate" label="Start Date (MM/YYYY)" placeholder="09/2020" />
                <AutosaveInput storageKey="education.current.endDate" label="End Date (MM/YYYY)" placeholder="06/2024" />
              </div>
            </div>

            <div>
              <div className="font-semibold mb-3">Other Secondary/High Schools</div>
              <AutosaveTextArea storageKey="education.other.schools" label="Other schools attended" placeholder="List any other high schools attended with dates" rows={3} />
            </div>

            <div>
              <div className="font-semibold mb-3">Colleges & Universities</div>
              <AutosaveTextArea storageKey="education.colleges" label="Colleges attended (if any)" placeholder="List any colleges attended with dates and degrees" rows={3} />
            </div>

            <div>
              <div className="font-semibold mb-3">Grades</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AutosaveInput storageKey="education.grades.current" label="Current GPA" placeholder="3.9" />
                <AutosaveInput storageKey="education.grades.cumulative" label="Cumulative GPA" placeholder="3.8" />
                <AutosaveInput storageKey="education.grades.weighted" label="Weighted GPA" placeholder="4.2" />
                <AutosaveInput storageKey="education.grades.classRank" label="Class Rank" placeholder="15/350" />
              </div>
            </div>

            <div>
              <div className="font-semibold mb-3">All Courses & Grades</div>
              <div className="space-y-4">
                <AutosaveTextArea storageKey="education.courses.grade9" label="9th Grade Courses & Grades" placeholder="e.g., Algebra I (A), English 9 (A-), Biology (B+)" rows={4} />
                <AutosaveTextArea storageKey="education.courses.grade10" label="10th Grade Courses & Grades" placeholder="e.g., Geometry (A), World History (A), Chemistry (A-)" rows={4} />
                <AutosaveTextArea storageKey="education.courses.grade11" label="11th Grade Courses & Grades" placeholder="e.g., AP Calculus AB (A), AP US History (A), AP Chemistry (B+)" rows={4} />
                <AutosaveTextArea storageKey="education.courses.grade12" label="12th Grade Courses & Grades" placeholder="e.g., AP Calculus BC (A), AP Literature (A-), AP Physics C (A)" rows={4} />
              </div>
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-2">Or upload transcript PDF:</div>
                <input type="file" accept=".pdf" className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  const apiKey = localStorage.getItem('geminiApiKey');
                  if (apiKey) formData.append('apiKey', apiKey);
                  try {
                    const res = await fetch('/api/gemini/questions-pdf', { method: 'POST', body: formData });
                    const data = await res.json();
                    if (data.fields) {
                      // Parse transcript and auto-fill courses
                      const coursesText = data.fields.find((f: any) => f.label.toLowerCase().includes('course'))?.label || 'Courses extracted from transcript';
                      localStorage.setItem('education.courses.current', coursesText);
                      // Force component to reload by triggering a page refresh
                      window.location.reload();
                    } else {
                      alert('Failed to parse transcript: ' + (data.error || 'Unknown error'));
                    }
                  } catch (err) {
                    alert('Failed to parse transcript');
                  }
                }} />
              </div>
            </div>
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
            <div ref={feedbackRef} className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg text-sm prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: essayFeedback.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>') }} />
          )}
        </div>
      </div>

        </div>
        {/* Chat functionality is now handled by the global CounselorBro component */}
      </div>
    </div>
  );
}
