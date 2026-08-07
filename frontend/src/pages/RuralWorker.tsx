import { useState } from "react";
import { api } from "../api";
import { MapPin, Loader, Phone, ClipboardList, Plus } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";

const URGENCY_STYLES: Record<string, { bg: string; border: string; text: string; badge: "danger" | "warning" | "info" | "success" }> = {
  RED:    { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-900",    badge: "danger" },
  ORANGE: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-900", badge: "warning" },
  YELLOW: { bg: "bg-amber-50",  border: "border-amber-300",  text: "text-amber-900",  badge: "warning" },
  GREEN:  { bg: "bg-emerald-50",border: "border-emerald-300",text: "text-emerald-900",badge: "success" },
};

const LANGS = [
  { code: "hi", name: "हिंदी" }, { code: "en", name: "English" },
  { code: "mr", name: "मराठी" }, { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు"}, { code: "bn", name: "বাংলা" },
];

const QUICK_SYMPTOMS = [
  "High fever", "Chest pain", "Difficulty breathing", "Vomiting",
  "Diarrhea", "Seizure", "Unconscious", "Heavy bleeding",
  "Child not eating", "Severe headache", "Jaundice", "Rash",
];

export default function RuralWorker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [lang, setLang] = useState("hi");
  const [symptoms, setSymptoms] = useState("");
  const [village, setVillage] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  const handleTriage = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const res = await api.ruralTriage({ symptoms_text: symptoms, language: lang, village, worker_name: workerName });
      setResult(res);
      setHistory(prev => [res, ...prev.slice(0, 9)]);
    } catch { setResult(null); }
    finally { setLoading(false); }
  };

  const addSymptom = (s: string) => {
    setSymptoms(prev => prev ? `${prev}, ${s}` : s);
  };

  const style = result ? (URGENCY_STYLES[result.urgency] || URGENCY_STYLES.GREEN) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="ASHA & Rural Community Health Worker Portal"
        subtitle="Field triage support, offline clinical guidelines, and referral routing for rural health workers"
        icon={MapPin}
      />

      {/* Top Registration Header */}
      <div className={`rounded-xl p-5 border bg-white shadow-xs ${result ? style!.border : "border-slate-200"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Field Triage Console</span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Community Patient Intake</h2>
          </div>
          {result && (
            <Badge variant={style!.badge} size="md">
              {result.urgency} — {result.urgency_label}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="ASHA Worker ID / Name"
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            value={workerName} onChange={e => setWorkerName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Village / Sub-Center Name"
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            value={village} onChange={e => setVillage(e.target.value)}
          />
          <div className="flex gap-1 overflow-x-auto">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  lang === l.code
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Quick Symptom Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {QUICK_SYMPTOMS.map(s => (
                <button
                  key={s}
                  onClick={() => addSymptom(s)}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-medium text-slate-700 hover:text-blue-700 rounded-lg transition-all flex items-center gap-1"
                >
                  <Plus size={11} /> {s}
                </button>
              ))}
            </div>

            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Chief Complaints & Clinical Observations</label>
            <textarea
              rows={4}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="Describe symptoms in Hindi, English, or regional script (e.g. तेज बुखार 3 दिन से, सांस लेने में तकलीफ)..."
              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 outline-none resize-none font-medium transition-all"
            />
            <button
              onClick={handleTriage}
              disabled={loading || !symptoms.trim()}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              {loading ? <><Loader size={15} className="animate-spin" /> Evaluating Community Triage...</> : "Execute ASHA Triage Assessment →"}
            </button>
          </div>

          {/* AI Field Guidance */}
          {result?.ai_guidance && (
            <div className={`rounded-xl p-5 border shadow-xs ${style!.bg} ${style!.border}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${style!.text}`}>📋 ASHA Field Action Protocol</h3>
              <p className="text-xs text-slate-900 leading-relaxed font-medium whitespace-pre-line">{result.ai_guidance}</p>
              {result.refer_to_hospital && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg text-red-900 font-bold text-xs">
                  ⚠️ IMMEDIATE HOSPITAL REFERRAL REQUIRED: {result.action}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Contacts & Guides */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Phone size={14} className="text-red-600" /> Emergency Dispatch Numbers
            </h3>
            {[
              { label: "National Ambulance", num: "108" },
              { label: "Women Helpline", num: "1091" },
              { label: "Child Emergency", num: "1098" },
              { label: "NIMHANS Crisis Line", num: "080-46110007" },
            ].map(({ label, num }) => (
              <a
                key={num}
                href={`tel:${num}`}
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg mb-1.5 transition-all"
              >
                <span className="text-xs font-medium text-slate-700">{label}</span>
                <span className="font-bold text-xs text-red-600">{num}</span>
              </a>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ClipboardList size={14} className="text-blue-600" /> Today's Field Assessments ({history.length})
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 border border-slate-100 border-dashed rounded-lg">No assessments recorded today</p>
            ) : (
              history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg mb-1.5 text-xs">
                  <span className="font-medium text-slate-700 truncate flex-1">{h.village || "Village"} · {h.timestamp?.slice(11, 16)}</span>
                  <Badge variant={URGENCY_STYLES[h.urgency]?.badge || "neutral"} size="sm">{h.urgency}</Badge>
                </div>
              ))
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-wider mb-2">🚦 Triage Color Standard</h3>
            {[
              { badge: "danger",  label: "RED — Critical Emergency: Call 108" },
              { badge: "warning", label: "ORANGE — Refer to PHC/CHC Today" },
              { badge: "warning", label: "YELLOW — Monitor Home Care" },
              { badge: "success", label: "GREEN — Mild Symptoms" },
            ].map(({ badge, label }, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1.5">
                <Badge variant={badge as any} size="sm">{label.split(" — ")[0]}</Badge>
                <span className="text-[11px] font-medium text-slate-600">{label.split(" — ")[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
