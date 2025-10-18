"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ChatbotPanel } from "@/components/ChatbotPanel";

export default function CollegeEditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [fields, setFields] = useState<{ id: string; label: string; type: "text" | "textarea" }[]>([]);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [percent, setPercent] = useState<number | null>(null);
  const categoryFromPercent = (p?: number | null) => {
    if (typeof p !== "number") return undefined;
    if (p >= 80) return "Safety" as const;
    if (p >= 50) return "Target" as const;
    return "Reach" as const;
  };

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("colleges")||"[]");
    const c = list.find((x: any)=>x.id===id);
    if (c) setName(c.name);
    const savedFields = localStorage.getItem(`college.${id}.fields`);
    const savedAnswers = localStorage.getItem(`college.${id}.answers`);
    if (savedFields) setFields(JSON.parse(savedFields));
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    const savedPrompt = localStorage.getItem(`college.${id}.prompt`);
    if (savedPrompt) setPrompt(savedPrompt);
    const p = localStorage.getItem(`college.${id}.percent`);
    if (p) setPercent(parseInt(p));
  }, [id]);

  useEffect(()=>{ localStorage.setItem(`college.${id}.fields`, JSON.stringify(fields)); }, [id, fields]);
  useEffect(()=>{ localStorage.setItem(`college.${id}.answers`, JSON.stringify(answers)); }, [id, answers]);
  useEffect(()=>{ localStorage.setItem(`college.${id}.prompt`, prompt); }, [id, prompt]);

  const generate = async () => {
    const res = await fetch("/api/gemini/questions", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ prompt })});
    const data = await res.json();
    setFields(data.fields || []);
  };

  const estimate = async () => {
    const profile = {
      gpa: localStorage.getItem("app.gpa"),
      sat: localStorage.getItem("app.sat"),
      activities: localStorage.getItem("app.activities"),
      honors: localStorage.getItem("app.honors"),
      additional: localStorage.getItem("app.additional"),
      majors: localStorage.getItem("profile.majors"),
      interests: localStorage.getItem("profile.interests"),
      location: localStorage.getItem("profile.location"),
      school: localStorage.getItem("profile.school"),
      hobbies: localStorage.getItem("profile.hobbies"),
      skills: localStorage.getItem("profile.skills"),
    };
    const res = await fetch("/api/gemini/chance", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ college: name, answers, profile })});
    const data = await res.json();
    setPercent(data.percent);
    localStorage.setItem(`college.${id}.percent`, String(data.percent));

    const list = JSON.parse(localStorage.getItem("colleges")||"[]");
    const idx = list.findIndex((x: any)=>x.id===id);
    if (idx>=0) { list[idx].percent = data.percent; localStorage.setItem("colleges", JSON.stringify(list)); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">{name || "College"}</div>
            {typeof percent === 'number' && (
              <div className="badge">{percent}% • {categoryFromPercent(percent)}</div>
            )}
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <div className="font-semibold">Paste the college's application questions</div>
          <textarea className="input min-h-[120px]" placeholder="Paste all the college's questions..." value={prompt} onChange={(e)=>setPrompt(e.target.value)} />
          <div>
            <button className="btn" onClick={generate}>Create Inputs</button>
          </div>
        </div>

        {fields.length>0 && (
          <div className="card p-6 space-y-4">
            <div className="text-lg font-semibold">Questions</div>
            {fields.map((f) => (
              <label key={f.id} className="block">
                <div className="mb-1 text-sm text-gray-600">{f.label}</div>
                {f.type === 'text' ? (
                  <input className="input" value={answers[f.id]||""} onChange={(e)=>setAnswers(a=>({...a,[f.id]: e.target.value}))} />
                ) : (
                  <textarea className="input min-h-[100px]" value={answers[f.id]||""} onChange={(e)=>setAnswers(a=>({...a,[f.id]: e.target.value}))} />
                )}
              </label>
            ))}
            <div><button className="btn" onClick={estimate}>Estimate Chance</button></div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <ChatbotPanel context={{ page: "college", college: name, answers }} />
      </div>
    </div>
  );
}
