import { useState } from "react";
import { api } from "../api";
import { GraduationCap, Loader, ChevronRight } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { AlertBanner } from "../components/ui/AlertBanner";

const LEVELS = [
  { level: 1, label: "Child / Elementary",  emoji: "🧒", desc: "Simple analogies & stories", badge: "neutral" },
  { level: 2, label: "Student / Adolescent", emoji: "📚", desc: "Basic biology concepts", badge: "info" },
  { level: 3, label: "Adult Patient",       emoji: "🎓", desc: "Standard clinical summary", badge: "success" },
  { level: 4, label: "Medical Student",    emoji: "🩺", desc: "Pathophysiological terms", badge: "warning" },
  { level: 5, label: "Clinician / Specialist", emoji: "👨‍⚕️", desc: "Full medical terminology", badge: "danger" },
];

const SAMPLE_REPORTS = [
  {
    label: "Blood Glucose & HbA1c",
    text: "Fasting Glucose: 118 mg/dL (Normal: 70-99). HbA1c: 6.2% (Normal: <5.7). Patient shows signs of pre-diabetes. Insulin levels elevated at 22 mIU/L."
  },
  {
    label: "Lipid Panel Profile",
    text: "Total Cholesterol: 245 mg/dL (High). LDL: 165 mg/dL (High). HDL: 38 mg/dL (Low). Triglycerides: 210 mg/dL (High). VLDL: 42 mg/dL (High)."
  },
  {
    label: "Complete Blood Count",
    text: "Hemoglobin: 10.2 g/dL (Low, Normal 13-17 for male). WBC: 12,500 cells/μL (Elevated). Platelets: 95,000/μL (Low). ESR: 45 mm/hr (Elevated)."
  },
];

export default function MedicalEducator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [reportText, setReportText] = useState(SAMPLE_REPORTS[0].text);
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [allLevelResults, setAllLevelResults] = useState<Record<number, string>>({});

  const handleExplain = async (lvl?: number) => {
    const level = lvl ?? selectedLevel;
    setLoading(true);
    try {
      const res = await api.educatorExplain({ report_text: reportText, level });
      setResult(res);
      setSelectedLevel(level);
      setAllLevelResults(prev => ({ ...prev, [level]: res.explanation }));
    } catch { }
    finally { setLoading(false); }
  };

  const handleExplainAll = async () => {
    setLoading(true);
    const results: Record<number, string> = {};
    for (const lvl of [1, 2, 3, 4, 5]) {
      try {
        const res = await api.educatorExplain({ report_text: reportText, level: lvl });
        results[lvl] = res.explanation;
      } catch { results[lvl] = "Could not generate explanation."; }
    }
    setAllLevelResults(results);
    setResult({ explanation: results[selectedLevel], level: selectedLevel, level_name: LEVELS[selectedLevel - 1].label });
    setLoading(false);
  };

  const lvl = LEVELS[selectedLevel - 1];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="AI Health Literacy & Medical Educator"
        subtitle="Translate complex pathology reports into 5 distinct comprehension levels from elementary to specialist"
        icon={GraduationCap}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Inputs */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical Report Text</label>
              <div className="flex gap-1.5">
                {SAMPLE_REPORTS.map((s, i) => (
                  <button
                    key={i} onClick={() => setReportText(s.text)}
                    className="text-[11px] font-medium px-2 py-1 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-md transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={6} value={reportText} onChange={e => setReportText(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 outline-none resize-none font-mono leading-relaxed transition-all"
            />
          </div>

          {/* Level Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 block">Target Comprehension Level</label>
            <div className="space-y-2">
              {LEVELS.map(l => (
                <button
                  key={l.level}
                  onClick={() => { setSelectedLevel(l.level); handleExplain(l.level); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    selectedLevel === l.level
                      ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{l.emoji}</span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">Level {l.level}: {l.label}</p>
                      <p className="text-[11px] text-slate-500">{l.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {allLevelResults[l.level] && <Badge variant="success" size="sm">Ready</Badge>}
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleExplain()} disabled={loading}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader size={14} className="animate-spin" /> : null} Translate Selected Level
              </button>
              <button
                onClick={handleExplainAll} disabled={loading}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                Translate All 5 Levels
              </button>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="space-y-4">
          {result ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-900 text-white flex items-center gap-3">
                <span className="text-2xl">{lvl.emoji}</span>
                <div>
                  <Badge variant={lvl.badge as any} size="sm">Level {lvl.level}</Badge>
                  <p className="text-sm font-bold text-white mt-0.5">{lvl.label} Explanation</p>
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium bg-slate-50 border border-slate-200 p-4 rounded-lg">
                  {result.explanation}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center py-24 text-center">
              <GraduationCap size={36} className="text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-500">Select a target comprehension level to generate tailored medical explanations</p>
            </div>
          )}

          {/* Comparison */}
          {Object.keys(allLevelResults).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs max-h-80 overflow-y-auto space-y-3">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Multi-Level Explanation Matrix</p>
              {LEVELS.filter(l => allLevelResults[l.level]).map(l => (
                <div key={l.level} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{l.emoji} Level {l.level}: {l.label}</p>
                    <Badge variant={l.badge as any} size="sm">{l.desc}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium line-clamp-3">{allLevelResults[l.level]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
