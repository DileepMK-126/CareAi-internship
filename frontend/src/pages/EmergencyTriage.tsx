import { useState } from "react";
import { api } from "../api";
import { AlertOctagon, Loader, Phone, ShieldAlert, CheckCircle, Info } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";

const SYMPTOMS_LIST = [
  "Chest Pain", "Left Arm Pain", "Jaw Pain", "Sweating",
  "Shortness of Breath", "Rapid Heartbeat", "Dizziness / Fainting",
  "Sudden Severe Headache", "Vision Loss", "Face Drooping",
  "Arm Weakness (one side)", "Speech Difficulty", "Confusion",
  "Stiff Neck", "High Fever (>103°F)", "Severe Abdominal Pain",
  "Rigid Abdomen", "Coughing Blood", "Loss of Consciousness",
  "Seizure", "Difficulty Breathing", "Swollen Throat / Lips",
  "Skin Rash (sudden)", "Nausea / Vomiting", "Severe Bleeding",
  "Back Pain (sudden severe)", "Numbness (one side)", "Slurred Speech",
];

const URGENCY_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  CRITICAL: { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-900",    badge: "bg-red-600 text-white" },
  HIGH:     { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-900", badge: "bg-orange-600 text-white" },
  MODERATE: { bg: "bg-amber-50",  border: "border-amber-300",  text: "text-amber-900",  badge: "bg-amber-600 text-white" },
  LOW:      { bg: "bg-emerald-50",border: "border-emerald-300",text: "text-emerald-900",badge: "bg-emerald-600 text-white" },
};

export default function EmergencyTriage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const toggleSymptom = (s: string) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setResult(null);
  };

  const handleTriage = async () => {
    if (!selected.length) return;
    setLoading(true); setError("");
    try {
      const res = await api.emergencyTriage(selected);
      setResult(res);
      if (res.high_risk_alert) setShowAlert(true);
    } catch (e: any) { setError(e.message || "Triage processing failed"); }
    finally { setLoading(false); }
  };

  const style = result ? (URGENCY_STYLES[result.urgency_level] || URGENCY_STYLES.LOW) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Critical Modal */}
      {showAlert && result?.high_risk_alert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowAlert(false)}>
          <div className="bg-white border-2 border-red-600 rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center animate-bounce">
                <AlertOctagon size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-red-700 font-extrabold text-lg">HIGH RISK EMERGENCY</h2>
                <p className="text-slate-700 text-xs font-semibold">{result.detected_condition}</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
              <p className="text-red-900 font-extrabold text-lg">{result.recommended_action}</p>
            </div>
            <div className="space-y-2">
              {Object.entries(result.emergency_contacts || {}).map(([k, v]: any) => (
                <a key={k} href={`tel:${v}`} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all">
                  <span className="text-xs font-semibold text-slate-700">{k}</span>
                  <span className="flex items-center gap-1.5 text-red-600 font-bold text-sm"><Phone size={13} /> {v}</span>
                </a>
              ))}
            </div>
            <button onClick={() => setShowAlert(false)} className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-all">
              Acknowledge Advisory
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Emergency Department Triage & Protocol"
          subtitle="Select acute symptoms for real-time risk stratification and immediate action guidance"
          icon={AlertOctagon}
        />
        <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-2xs">
          🚨 India Emergency Dispatch: <span className="font-extrabold text-red-600 text-sm">108</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Symptom Selector Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-slate-900 font-bold text-sm">Acute Symptom Checklist</h2>
              {selected.length > 0 && (
                <button onClick={() => setSelected([])} className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors">Clear selection</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS_LIST.map(s => {
                const active = selected.includes(s);
                const isDanger = ["Chest Pain","Left Arm Pain","Face Drooping","Loss of Consciousness","Seizure","Coughing Blood","Swollen Throat / Lips"].includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active
                        ? isDanger
                          ? "bg-red-600 border-red-700 text-white shadow-2xs"
                          : "bg-amber-600 border-amber-700 text-white shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {active ? <span className="mr-1">✓</span> : null}{s}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">{selected.length} symptom{selected.length !== 1 ? "s" : ""} active</p>
              <button
                onClick={handleTriage}
                disabled={loading || !selected.length}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                {loading ? <><Loader size={14} className="animate-spin" /> Evaluating Triage...</> : "Run Emergency Triage →"}
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs font-semibold">{error}</div>}

          {/* AI Guidance Text */}
          {result?.ai_guidance && (
            <div className={`border rounded-xl p-5 shadow-xs ${style?.bg} ${style?.border}`}>
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className={style?.text} />
                <h3 className={`text-sm font-bold ${style?.text}`}>Emergency First Aid & Triage Guidance</h3>
              </div>
              <div className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">{result.ai_guidance}</div>
            </div>
          )}
        </div>

        {/* Right Output Panel */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Stratification Card */}
              <div className={`border rounded-xl p-6 text-center shadow-xs ${style?.bg} ${style?.border}`}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${style?.badge} mb-3 shadow-xs`}>
                  {result.urgency_level === "CRITICAL" ? <AlertOctagon size={26} /> :
                   result.urgency_level === "HIGH" ? <ShieldAlert size={26} /> :
                   result.urgency_level === "MODERATE" ? <Info size={26} /> :
                   <CheckCircle size={26} />}
                </div>
                <div className={`text-2xl font-extrabold mb-1 ${style?.text}`}>{result.urgency_level}</div>
                <div className={`text-[11px] font-bold px-3 py-0.5 rounded-full inline-block ${style?.badge} mb-2`}>{result.alert_type}</div>
                {result.detected_condition && (
                  <p className="text-xs font-bold text-slate-900 mt-2">{result.detected_condition}</p>
                )}
              </div>

              {/* Action Directive */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Recommended Directive</h3>
                <p className={`font-bold text-xs ${style?.text}`}>{result.recommended_action}</p>
              </div>

              {/* Contacts */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">Emergency Contact Dispatch</h3>
                <div className="space-y-2">
                  {Object.entries(result.emergency_contacts || {}).map(([k, v]: any) => (
                    <a key={k} href={`tel:${v}`} className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all">
                      <span className="text-xs font-medium text-slate-700">{k}</span>
                      <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                        <Phone size={12} /> {v}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center py-16 px-4 gap-2 text-center">
              <ShieldAlert size={36} className="text-slate-300 mb-1" />
              <p className="text-slate-500 text-xs font-medium">Select symptoms on the left to initiate real-time emergency triage evaluation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
