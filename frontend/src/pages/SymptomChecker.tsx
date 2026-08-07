import { useState, useEffect } from "react";
import { AlertOctagon, Heart, ShieldAlert, Loader, Activity } from "lucide-react";
import { api } from "../api";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { AlertBanner } from "../components/ui/AlertBanner";

const getSeverityBadgeVariant = (severity: string): "success" | "warning" | "danger" => {
  const s = severity.toLowerCase();
  if (s.includes("low")) return "success";
  if (s.includes("moderate")) return "warning";
  return "danger";
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Clinical Symptom Checker & Triage"
        subtitle="Evaluate chief complaints, symptom severity, differential probabilities, and urgent action pathways"
        icon={Activity}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Input Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm mb-3">Symptom Description & History</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe symptoms in detail (e.g. Mild persistent headache for 2 days, low-grade fever 100°F, fatigue, dry cough)..."
                  rows={6}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-400 outline-none resize-none transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !symptoms.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={15} className="animate-spin" /> Evaluating Symptoms...
                  </>
                ) : (
                  <>
                    <Activity size={15} /> Evaluate Symptom Severity
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="mt-6 p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-slate-700 leading-relaxed font-medium">
            <strong>⚠️ Notice:</strong> Automated clinical symptom assessment is intended for preliminary triage support. If experiencing severe chest pain, sudden numbness, or shortness of breath, please call emergency services immediately.
          </div>
        </div>

        {/* Right Diagnostic Output */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="font-bold text-slate-900 text-sm">AI Triage Assessment</h2>
            {result && <Badge variant={getSeverityBadgeVariant(result.severity)} size="sm">Triage Complete</Badge>}
          </div>

          {result ? (
            <div className="space-y-4 flex-1">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Severity Classification</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">{result.severity}</div>
                </div>
                <Badge variant={getSeverityBadgeVariant(result.severity)} size="md">{result.severity}</Badge>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Differential Diagnoses</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.possible_conditions?.map((cond: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium border border-slate-200">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Recommended Pathway</h3>
                <p className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  {result.recommended_action}
                </p>
              </div>

              <AlertBanner
                variant={result.severity?.toLowerCase().includes("high") ? "error" : "warning"}
                title="Clinical Advisory"
                message={result.emergency_warning}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <Heart size={36} className="text-slate-300 mb-2 animate-pulse" />
              <p className="text-xs font-medium text-slate-500">Enter symptoms on the left to view automated clinical triage results</p>
            </div>
          )}
        </div>
      </div>

      {/* Symptom Check History */}
      {history.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Symptom Assessment Log ({history.length})</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {[...history].reverse().map((h: any) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-lg transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs font-bold text-slate-900 truncate">"{h.symptoms}"</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{h.date} • {h.possible_conditions?.join(", ")}</p>
                </div>
                <Badge variant={getSeverityBadgeVariant(h.severity)} size="sm">{h.severity}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
