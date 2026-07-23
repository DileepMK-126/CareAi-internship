import { useState } from "react";
import { api } from "../api";
import { AlertOctagon, Loader, Phone, ShieldAlert, CheckCircle, XCircle, Info } from "lucide-react";

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
  CRITICAL: { bg: "bg-red-950/60", border: "border-red-500/50", text: "text-red-400", badge: "bg-red-600" },
  HIGH:     { bg: "bg-orange-950/40", border: "border-orange-500/40", text: "text-orange-400", badge: "bg-orange-600" },
  MODERATE: { bg: "bg-amber-950/40", border: "border-amber-500/40", text: "text-amber-400", badge: "bg-amber-600" },
  LOW:      { bg: "bg-green-950/30", border: "border-green-500/30", text: "text-green-400", badge: "bg-green-600" },
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
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const style = result ? (URGENCY_STYLES[result.urgency_level] || URGENCY_STYLES.LOW) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {}
      {showAlert && result?.high_risk_alert && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAlert(false)}>
          <div className="bg-gray-950 border-2 border-red-500 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-500/20 animate-pulse-once" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                <AlertOctagon size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-red-400 font-bold text-lg">⚠️ HIGH RISK ALERT</h2>
                <p className="text-red-300 text-sm">{result.detected_condition}</p>
              </div>
            </div>
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-white font-bold text-center text-xl">{result.recommended_action}</p>
            </div>
            <div className="space-y-2">
              {Object.entries(result.emergency_contacts || {}).map(([k, v]: any) => (
                <a key={k} href={`tel:${v}`} className="flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-700 transition-all">
                  <span className="text-sm text-gray-300">{k}</span>
                  <span className="flex items-center gap-2 text-red-400 font-bold"><Phone size={14} /> {v}</span>
                </a>
              ))}
            </div>
            <button onClick={() => setShowAlert(false)} className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-sm transition-all">
              Close Alert
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center animate-pulse">
          <AlertOctagon size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Emergency Triage System</h1>
          <p className="text-sm text-gray-500">Select symptoms for real-time AI risk assessment</p>
        </div>
        <div className="ml-auto text-xs text-gray-600 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">
          🚨 India Emergency: <span className="text-red-400 font-bold">108</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Select All Symptoms Present</h2>
              {selected.length > 0 && (
                <button onClick={() => setSelected([])} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Clear all</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS_LIST.map(s => {
                const active = selected.includes(s);
                const isDanger = ["Chest Pain","Left Arm Pain","Face Drooping","Loss of Consciousness","Seizure","Coughing Blood","Swollen Throat / Lips"].includes(s);
                return (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                      active
                        ? isDanger
                          ? "bg-red-600 border-red-500 text-white"
                          : "bg-amber-600 border-amber-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}>
                    {active ? <span className="mr-1">✓</span> : null}{s}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-600">{selected.length} symptom{selected.length !== 1 ? "s" : ""} selected</p>
              <button onClick={handleTriage} disabled={loading || !selected.length}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all">
                {loading ? <><Loader size={14} className="animate-spin" /> Analyzing...</> : "Run Triage →"}
              </button>
            </div>
          </div>

          {error && <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}

          {}
          {result?.ai_guidance && (
            <div className={`border rounded-2xl p-5 ${style?.bg} ${style?.border}`}>
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className={style?.text} />
                <h3 className={`text-sm font-semibold ${style?.text}`}>AI First Aid Guidance</h3>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{result.ai_guidance}</div>
            </div>
          )}
        </div>

        {}
        <div className="space-y-4">
          {result ? (
            <>
              {}
              <div className={`border rounded-2xl p-5 text-center ${style?.bg} ${style?.border}`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${style?.badge} mb-3`}>
                  {result.urgency_level === "CRITICAL" ? <AlertOctagon size={28} className="text-white" /> :
                   result.urgency_level === "HIGH" ? <ShieldAlert size={28} className="text-white" /> :
                   result.urgency_level === "MODERATE" ? <Info size={28} className="text-white" /> :
                   <CheckCircle size={28} className="text-white" />}
                </div>
                <div className={`text-2xl font-black mb-1 ${style?.text}`}>{result.urgency_level}</div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${style?.badge} text-white mb-2`}>{result.alert_type}</div>
                {result.detected_condition && (
                  <p className="text-sm text-white font-semibold mt-2">{result.detected_condition}</p>
                )}
              </div>

              {}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-gray-400 text-xs font-semibold mb-2">RECOMMENDED ACTION</h3>
                <p className={`font-bold text-sm ${style?.text}`}>{result.recommended_action}</p>
              </div>

              {}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-gray-400 text-xs font-semibold mb-3">EMERGENCY CONTACTS</h3>
                <div className="space-y-2">
                  {Object.entries(result.emergency_contacts || {}).map(([k, v]: any) => (
                    <a key={k} href={`tel:${v}`} className="flex items-center justify-between p-2.5 bg-gray-800 hover:bg-gray-750 rounded-xl border border-gray-700 transition-all group">
                      <span className="text-xs text-gray-400">{k}</span>
                      <span className="flex items-center gap-1.5 text-red-400 font-bold text-sm group-hover:text-red-300">
                        <Phone size={12} /> {v}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-600 text-center">{result.disclaimer}</p>
            </>
          ) : (
            <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
              <ShieldAlert size={40} className="text-gray-700" />
              <p className="text-gray-600 text-sm text-center px-4">Select symptoms and click Run Triage to assess risk level</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
