import { useState, useEffect } from "react";
import { AlertOctagon, Heart, ShieldAlert, Loader, Activity } from "lucide-react";
import { api } from "../api";

const severityColor = (severity: string) => {
  if (severity.toLowerCase().includes("low")) return { text: "text-green-400", bg: "bg-green-900/30", border: "border-green-500/30" };
  if (severity.toLowerCase().includes("moderate")) return { text: "text-amber-400", bg: "bg-amber-900/30", border: "border-amber-500/30" };
  if (severity.toLowerCase().includes("high")) return { text: "text-orange-400", bg: "bg-orange-900/30", border: "border-orange-500/30" };
  return { text: "text-red-400", bg: "bg-red-900/30", border: "border-red-500/30" };
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getSymptomHistory().then(setHistory).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const res = await api.checkSymptoms(symptoms);
      setResult(res);
      const h = await api.getSymptomHistory();
      setHistory(h);
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity size={24} className="text-blue-500" />
          Symptom Checker
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Input symptoms to review severity levels and clinical recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-white text-sm mb-4">Describe Your Symptoms</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g., I have been feeling a mild headache and fever for two days, and a slight dry cough..."
                  rows={6}
                  className="w-full bg-gray-950 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-4 text-sm text-gray-300 placeholder-gray-600 outline-none resize-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !symptoms.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={14} className="animate-spin" /> Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Activity size={14} /> Check Symptoms
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-400">
            <strong>⚠️ Disclaimer:</strong> This symptom checker is powered by automated health intelligence heuristics. It does NOT constitute a certified medical diagnosis or professional clinical advice. If you are experiencing severe pain, crushing pressure, or difficulty breathing, please seek immediate emergency care.
          </div>
        </div>

        {}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold text-white text-sm mb-5">AI Symptom Analysis</h2>
          {result ? (
            <div className="space-y-5">
              <div className={`p-4 rounded-xl border ${severityColor(result.severity).bg} ${severityColor(result.severity).border} flex justify-between items-center`}>
                <div>
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Severity Level</div>
                  <div className={`text-lg font-bold ${severityColor(result.severity).text}`}>{result.severity}</div>
                </div>
                <AlertOctagon size={28} className={severityColor(result.severity).text} />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Possible Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {result.possible_conditions.map((cond: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium border border-gray-700/50">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Recommended Pathway</h3>
                <p className="text-sm text-gray-300 bg-gray-950 p-4 rounded-xl border border-gray-800 leading-relaxed">
                  {result.recommended_action}
                </p>
              </div>

              <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-3">
                <ShieldAlert size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Emergency Advisory</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {result.emergency_warning}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart size={36} className="text-gray-700 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-600">Submit symptoms in the input card to generate an AI assessment report.</p>
            </div>
          )}
        </div>
      </div>

      {}
      {history.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Symptom Search History</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {[...history].reverse().map((h: any) => {
              const sev = severityColor(h.severity);
              return (
                <div key={h.id} className="flex items-center justify-between p-3.5 bg-gray-850/50 hover:bg-gray-850 border border-gray-800/45 rounded-lg transition-all">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm text-gray-300 truncate font-medium">"{h.symptoms}"</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{h.date} • {h.possible_conditions?.join(", ")}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${sev.bg} ${sev.text}`}>
                    {h.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
