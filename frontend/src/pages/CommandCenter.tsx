import { useState, useRef } from "react";
import { api } from "../api";
import { Zap, Upload, Loader, CheckCircle, Circle, ChevronDown, ChevronUp, AlertTriangle, FileText, Activity } from "lucide-react";

const PIPELINE_STEPS = [
  { id: "report_analysis",    label: "Parse Medical Report",      icon: FileText,       color: "blue" },
  { id: "timeline_entry",     label: "Update Health Timeline",    icon: Activity,       color: "cyan" },
  { id: "risk_assessment",    label: "Calculate Risk Scores",     icon: AlertTriangle,  color: "amber" },
  { id: "drug_interactions",  label: "Check Drug Interactions",   icon: Zap,            color: "red" },
  { id: "diet_plan",          label: "Generate Diet Plan",        icon: CheckCircle,    color: "green" },
  { id: "doctor_questions",   label: "Generate Doctor Questions", icon: CheckCircle,    color: "teal" },
  { id: "dashboard_summary",  label: "Update Dashboard",          icon: Activity,       color: "indigo" },
];

export default function CommandCenter() {
  const [file, setFile] = useState<File | null>(null);
  const [reportText, setReportText] = useState("");
  const [medications, setMedications] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (k: string) => setExpanded(p => ({ ...p, [k]: !p[k] }));

  const handleRun = async () => {
    if (!file && !reportText.trim()) return;
    setLoading(true); setError(""); setResult(null); setCurrentStep(0);

    try {
      let res: any;
      if (file) {
        for (let i = 0; i < PIPELINE_STEPS.length - 1; i++) {
          setCurrentStep(i);
          await new Promise(r => setTimeout(r, 400));
        }
        const form = new FormData();
        form.append("file", file);
        form.append("user_id", JSON.parse(localStorage.getItem("careai_user") || "{}").id || "demo-user");
        form.append("medications", medications);
        res = await api.commandCenterUpload(form);
      } else {
        const meds = medications.split(",").map(m => m.trim()).filter(Boolean);
        for (let i = 0; i < PIPELINE_STEPS.length - 1; i++) {
          setCurrentStep(i);
          await new Promise(r => setTimeout(r, 350));
        }
        res = await api.commandCenter({ report_text: reportText, medications: meds });
      }
      setCurrentStep(PIPELINE_STEPS.length);
      setResult(res);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const riskColor: Record<string, string> = {
    "High Risk": "text-red-400", "Moderate Risk": "text-amber-400", "Low Risk": "text-green-400"
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Healthcare Command Center</h1>
          <p className="text-sm text-gray-500">One-click full health intelligence pipeline — upload once, get everything</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">Upload Report & Configure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Medical Report (PDF / DOCX / TXT)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                file ? "border-blue-500/50 bg-blue-500/5" : "border-gray-700 hover:border-gray-600"
              }`}>
              <Upload size={24} className={`mx-auto mb-2 ${file ? "text-blue-400" : "text-gray-600"}`} />
              {file ? (
                <div>
                  <p className="text-sm text-blue-400 font-medium">{file.name}</p>
                  <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Click to upload or drag & drop</p>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                onChange={e => { setFile(e.target.files?.[0] || null); setReportText(""); }} />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Or Paste Report Text</label>
              <textarea rows={4} placeholder="Paste your medical report text here..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                value={reportText} onChange={e => { setReportText(e.target.value); setFile(null); }} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current Medications (comma-separated, optional)</label>
              <input type="text" placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-blue-500"
                value={medications} onChange={e => setMedications(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={handleRun} disabled={loading || (!file && !reportText.trim())}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20">
          {loading ? <><Loader size={16} className="animate-spin" /> Running Pipeline...</> : <><Zap size={16} /> Run Complete Health Analysis</>}
        </button>
        {error && <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}
      </div>

      {(loading || result) && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Pipeline Progress</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = currentStep > i || (!loading && result);
              const active = currentStep === i && loading;
              return (
                <div key={step.id} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  done ? "border-green-500/30 bg-green-500/5" :
                  active ? "border-blue-500/50 bg-blue-500/10 animate-pulse" :
                  "border-gray-800 bg-gray-800/30"
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    done ? "bg-green-600" : active ? "bg-blue-600" : "bg-gray-800"
                  }`}>
                    {done ? <CheckCircle size={16} className="text-white" /> :
                     active ? <Loader size={16} className="text-white animate-spin" /> :
                     <Circle size={16} className="text-gray-600" />}
                  </div>
                  <p className={`text-xs text-center leading-tight ${done ? "text-green-400" : active ? "text-blue-400" : "text-gray-600"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {result.dashboard_summary && (
            <div className="bg-gradient-to-br from-gray-900 to-blue-900/20 border border-blue-500/20 rounded-2xl p-5">
              <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" /> Analysis Complete
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center bg-gray-900/60 rounded-xl p-3">
                  <div className="text-3xl font-black text-white">{result.dashboard_summary.health_score}</div>
                  <div className="text-xs text-gray-500">Health Score</div>
                </div>
                <div className="text-center bg-gray-900/60 rounded-xl p-3">
                  <div className="text-3xl font-black text-red-400">{result.dashboard_summary.active_risks?.length || 0}</div>
                  <div className="text-xs text-gray-500">Active Risks</div>
                </div>
                <div className="text-center bg-gray-900/60 rounded-xl p-3">
                  <div className="text-3xl font-black text-amber-400">{result.dashboard_summary.key_alerts?.length || 0}</div>
                  <div className="text-xs text-gray-500">Alerts</div>
                </div>
                <div className="text-center bg-gray-900/60 rounded-xl p-3">
                  <div className="text-3xl font-black text-green-400">{result.dashboard_summary.pipeline_steps_completed}/7</div>
                  <div className="text-xs text-gray-500">Steps Done</div>
                </div>
              </div>
              {(result.dashboard_summary.key_alerts || []).length > 0 && (
                <div className="mt-3 space-y-1">
                  {result.dashboard_summary.key_alerts.map((alert: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/5 px-3 py-1.5 rounded-lg border border-amber-400/10">
                      <AlertTriangle size={11} /> {alert}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {[
            { key: "report_analysis", label: "📋 Report Analysis", render: (d: any) => (
              <div className="space-y-2">
                <p className="text-sm text-gray-300">{d.summary}</p>
                {d.test_metrics?.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg text-xs">
                    <span className="text-gray-400">{m.test_name}</span>
                    <span className={m.is_abnormal ? "text-red-400 font-bold" : "text-green-400"}>{m.value} {m.unit}</span>
                  </div>
                ))}
              </div>
            )},
            { key: "risk_assessment", label: "⚠️ Risk Assessment", render: (d: any) => (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(d).map(([k, v]: any) => (
                  <div key={k} className="text-center bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1 capitalize">{k.replace(/_/g, " ")}</p>
                    <p className={`text-sm font-bold ${riskColor[v] || "text-gray-400"}`}>{v}</p>
                  </div>
                ))}
              </div>
            )},
            { key: "diet_plan", label: "🥗 3-Day Diet Plan", render: (d: any) => (
              <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">{typeof d === "string" ? d : JSON.stringify(d, null, 2)}</p>
            )},
            { key: "doctor_questions", label: "🩺 Doctor Visit Questions", render: (d: any) => (
              <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">{d}</p>
            )},
            { key: "drug_interactions", label: "💊 Drug Interactions", render: (d: any) => (
              <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">{d}</p>
            )},
          ].map(({ key, label, render }) => {
            if (!result[key]) return null;
            return (
              <div key={key} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <button onClick={() => toggle(key)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/40 transition-colors">
                  <span className="text-sm font-semibold text-white">{label}</span>
                  {expanded[key] ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                </button>
                {expanded[key] && (
                  <div className="px-4 pb-4">{render(result[key])}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
