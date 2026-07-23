import { useState } from "react";
import { api } from "../api";
import { GraduationCap, Loader, ChevronRight } from "lucide-react";

const LEVELS = [
  { level: 1, label: "Child",         emoji: "🧒", desc: "Age 6-10",       color: "from-yellow-600 to-orange-600" },
  { level: 2, label: "Student",       emoji: "📚", desc: "Age 11-17",      color: "from-blue-600 to-cyan-600" },
  { level: 3, label: "Graduate",      emoji: "🎓", desc: "Age 18+",        color: "from-green-600 to-teal-600" },
  { level: 4, label: "Med Student",   emoji: "🩺", desc: "Clinical",       color: "from-purple-600 to-violet-600" },
  { level: 5, label: "Doctor",        emoji: "👨‍⚕️", desc: "Clinical Expert", color: "from-red-600 to-pink-600" },
];

const SAMPLE_REPORTS = [
  {
    label: "Blood Sugar Report",
    text: "Fasting Glucose: 118 mg/dL (Normal: 70-99). HbA1c: 6.2% (Normal: <5.7). Patient shows signs of pre-diabetes. Insulin levels elevated at 22 mIU/L."
  },
  {
    label: "Lipid Panel",
    text: "Total Cholesterol: 245 mg/dL (High). LDL: 165 mg/dL (High). HDL: 38 mg/dL (Low). Triglycerides: 210 mg/dL (High). VLDL: 42 mg/dL (High)."
  },
  {
    label: "CBC Report",
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
    } catch {  }
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Medical Educator</h1>
          <p className="text-sm text-gray-500">Patient-friendly report translation tailored to 5 distinct comprehension levels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Report / Medical Text</label>
              <div className="flex gap-1.5">
                {SAMPLE_REPORTS.map((s, i) => (
                  <button key={i} onClick={() => setReportText(s.text)}
                    className="text-xs px-2 py-1 bg-gray-800 hover:bg-indigo-600/20 border border-gray-700 hover:border-indigo-500/40 text-gray-500 hover:text-white rounded-lg transition-all">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea rows={7} value={reportText} onChange={e => setReportText(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 resize-none font-mono text-xs leading-relaxed" />
          </div>

          {}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <label className="text-xs text-gray-500 mb-3 block">Choose Explanation Level</label>
            <div className="space-y-2">
              {LEVELS.map(l => (
                <button key={l.level} onClick={() => { setSelectedLevel(l.level); handleExplain(l.level); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedLevel === l.level ? "border-transparent" : "bg-gray-800 border-gray-700 hover:border-gray-600"}`}
                  style={selectedLevel === l.level ? { background: `linear-gradient(to right, var(--tw-gradient-stops))` } : {}}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${l.color} text-lg flex-shrink-0`}>
                    {l.emoji}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-white">Level {l.level}: {l.label}</p>
                    <p className="text-xs text-gray-500">{l.desc}</p>
                  </div>
                  {allLevelResults[l.level] && <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={() => handleExplain()} disabled={loading}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                {loading ? <Loader size={13} className="animate-spin" /> : null} Explain This Level
              </button>
              <button onClick={handleExplainAll} disabled={loading}
                className="py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                Explain All 5 Levels
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-4">
          {result ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className={`p-4 bg-gradient-to-r ${lvl.color} flex items-center gap-3`}>
                <span className="text-3xl">{lvl.emoji}</span>
                <div>
                  <p className="text-white font-bold">Level {lvl.level}: {lvl.label}</p>
                  <p className="text-white/70 text-xs">{lvl.desc}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{result.explanation}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
              <GraduationCap size={40} className="text-gray-700" />
              <p className="text-gray-600 text-sm">Select a level to generate explanation</p>
            </div>
          )}

          {}
          {Object.keys(allLevelResults).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 max-h-80 overflow-y-auto">
              <p className="text-xs text-gray-500 font-semibold mb-3">All Levels Comparison</p>
              {LEVELS.filter(l => allLevelResults[l.level]).map(l => (
                <div key={l.level} className="mb-3 pb-3 border-b border-gray-800 last:border-0">
                  <p className="text-xs font-bold text-gray-400 mb-1">{l.emoji} Level {l.level}: {l.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{allLevelResults[l.level]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
