import { useState, useRef } from "react";
import { api } from "../api";
import { Zap, Upload, Loader, CheckCircle, Circle, ChevronDown, ChevronUp, AlertTriangle, FileText, Activity } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { AlertBanner } from "../components/ui/AlertBanner";

const PIPELINE_STEPS = [
  { id: "report_analysis",    label: "Parse Medical Report",      icon: FileText },
  { id: "timeline_entry",     label: "Update Health Timeline",    icon: Activity },
  { id: "risk_assessment",    label: "Calculate Risk Scores",     icon: AlertTriangle },
  { id: "drug_interactions",  label: "Check Drug Interactions",   icon: Zap },
  { id: "diet_plan",          label: "Generate Diet Plan",        icon: CheckCircle },
  { id: "doctor_questions",   label: "Generate Doctor Questions", icon: CheckCircle },
  { id: "dashboard_summary",  label: "Update Dashboard",          icon: Activity },
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
    } catch (e: any) { setError(e.message || "Pipeline execution failed"); }
    finally { setLoading(false); }
  };

  const getRiskBadge = (v: string): "danger" | "warning" | "success" => {
    if (v === "High Risk") return "danger";
    if (v === "Moderate Risk") return "warning";
    return "success";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Clinical Diagnostic Command Center"
        subtitle="Execute end-to-end multi-agent clinical diagnostic pipeline with a single document upload"
        icon={Zap}
      />

      {/* Input Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <h2 className="text-slate-900 font-bold text-sm">Pipeline Input Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Upload Document (PDF / DOCX / TXT)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all bg-white ${
                file ? "border-blue-600 bg-blue-50/60" : "border-slate-300 hover:border-blue-500 hover:bg-slate-50"
              }`}
            >
              <Upload size={24} className={`mx-auto mb-2 ${file ? "text-blue-600" : "text-slate-400"}`} />
              {file ? (
                <div>
                  <p className="text-xs font-bold text-blue-700">{file.name}</p>
                  <p className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-500">Click to upload report file or drag & drop</p>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                onChange={e => { setFile(e.target.files?.[0] || null); setReportText(""); }} />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Or Paste Clinical Text</label>
              <textarea
                rows={4}
                placeholder="Paste lab report, discharge summary, or clinical notes text..."
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none resize-none font-medium transition-all"
                value={reportText}
                onChange={e => { setReportText(e.target.value); setFile(null); }}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Active Medications (comma-separated, optional)</label>
              <input
                type="text"
                placeholder="e.g. Metformin 500mg, Atorvastatin 20mg"
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium transition-all"
                value={medications}
                onChange={e => setMedications(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={loading || (!file && !reportText.trim())}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
        >
          {loading ? <><Loader size={16} className="animate-spin" /> Executing Multi-Agent Diagnostic Pipeline...</> : <><Zap size={16} /> Run Full Diagnostic Analysis</>}
        </button>

        {error && <AlertBanner variant="error" message={error} dismissible />}
      </div>

      {/* Progress Indicators */}
      {(loading || result) && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-slate-900 font-bold text-sm mb-4">Pipeline Execution Progress</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = currentStep > i || (!loading && result);
              const active = currentStep === i && loading;
              return (
                <div key={step.id} className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all ${
                  done ? "border-emerald-300 bg-emerald-50/70" :
                  active ? "border-blue-500 bg-blue-50/80 animate-pulse" :
                  "border-slate-200 bg-slate-50/50"
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    done ? "bg-emerald-600 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
                  }`}>
                    {done ? <CheckCircle size={14} /> :
                     active ? <Loader size={14} className="animate-spin" /> :
                     <Circle size={14} />}
                  </div>
                  <p className={`text-[11px] font-bold leading-tight ${done ? "text-emerald-900" : active ? "text-blue-900" : "text-slate-500"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pipeline Result Cards */}
      {result && !loading && (
        <div className="space-y-4">
          {result.dashboard_summary && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <h2 className="text-slate-900 font-bold text-base">Pipeline Execution Summary</h2>
                </div>
                <Badge variant="success" size="md">Completed</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                  <div className="text-2xl font-extrabold text-blue-600">{result.dashboard_summary.health_score}</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Calculated Health Index</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                  <div className="text-2xl font-extrabold text-red-600">{result.dashboard_summary.active_risks?.length || 0}</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Active Pathological Risks</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                  <div className="text-2xl font-extrabold text-amber-600">{result.dashboard_summary.key_alerts?.length || 0}</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Critical Lab Alerts</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                  <div className="text-2xl font-extrabold text-emerald-600">{result.dashboard_summary.pipeline_steps_completed}/7</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Pipeline Stages</div>
                </div>
              </div>

              {(result.dashboard_summary.key_alerts || []).length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.dashboard_summary.key_alerts.map((alert: string, i: number) => (
                    <AlertBanner key={i} variant="warning" message={alert} />
                  ))}
                </div>
              )}
            </div>
          )}

          {[
            { key: "report_analysis", label: "📋 Medical Report Extraction Details", render: (d: any) => (
              <div className="space-y-3">
                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">{d.summary}</p>
                {d.test_metrics?.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium">
                    <span className="text-slate-700">{m.test_name}</span>
                    <Badge variant={m.is_abnormal ? "danger" : "success"} size="sm">{m.value} {m.unit}</Badge>
                  </div>
                ))}
              </div>
            )},
            { key: "risk_assessment", label: "⚠️ Stratified Health Risk Scores", render: (d: any) => (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(d).map(([k, v]: any) => (
                  <div key={k} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">{k.replace(/_/g, " ")}</p>
                    <Badge variant={getRiskBadge(v)} size="md">{v}</Badge>
                  </div>
                ))}
              </div>
            )},
            { key: "diet_plan", label: "🥗 Personalized Clinical Nutrition Plan", render: (d: any) => (
              <div className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3.5 leading-relaxed font-medium whitespace-pre-line">
                {typeof d === "string" ? d : JSON.stringify(d, null, 2)}
              </div>
            )},
            { key: "doctor_questions", label: "🩺 Recommended Doctor Visit Consultation Questions", render: (d: any) => (
              <div className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3.5 leading-relaxed font-medium whitespace-pre-line">{d}</div>
            )},
            { key: "drug_interactions", label: "💊 Pharmacological Interaction Evaluation", render: (d: any) => (
              <div className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3.5 leading-relaxed font-medium whitespace-pre-line">{d}</div>
            )},
          ].map(({ key, label, render }) => {
            if (!result[key]) return null;
            return (
              <div key={key} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => toggle(key)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  <span className="text-xs font-bold text-slate-900">{label}</span>
                  {expanded[key] ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </button>
                {expanded[key] && (
                  <div className="p-4 bg-slate-50/50">{render(result[key])}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
