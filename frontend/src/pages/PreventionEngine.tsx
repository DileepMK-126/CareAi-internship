import { useState } from "react";
import { api } from "../api";
import { Shield, Loader, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { AlertBanner } from "../components/ui/AlertBanner";

const FACTOR_STATUS: Record<string, "danger" | "warning" | "info"> = {
  critical: "danger",
  warning:  "warning",
  info:     "info",
};

export default function PreventionEngine() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    age: 40, bmi: 26.0, glucose: 95, hba1c: 5.8,
    systolic_bp: 130, total_cholesterol: 210, ldl: 130, hdl: 45,
    egfr: 75, uric_acid: 6.5, alt: 35, exercise_days_per_week: 2,
    smoking: false, alcohol_units_week: 0,
    family_history: { diabetes: false, heart_disease: false },
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const setFH = (k: string, v: boolean) => setForm(f => ({ ...f, family_history: { ...f.family_history, [k]: v } }));

  const handleAnalyze = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.preventionEngine(form);
      setResult(res.result || res);
    } catch (e: any) { setError(e.message || "Prevention analysis failed"); }
    finally { setLoading(false); }
  };

  const SLIDERS = [
    { k: "age",              l: "Age",                  min: 18, max: 90,  step: 1,   unit: "yrs" },
    { k: "bmi",              l: "Body Mass Index (BMI)",min: 16, max: 50,  step: 0.1, unit: "kg/m²" },
    { k: "glucose",          l: "Fasting Glucose",      min: 60, max: 300, step: 1,   unit: "mg/dL" },
    { k: "hba1c",            l: "Glycated Hemoglobin",  min: 4,  max: 13,  step: 0.1, unit: "%" },
    { k: "systolic_bp",      l: "Systolic Blood Pressure",min: 90, max: 200, step: 1, unit: "mmHg" },
    { k: "total_cholesterol",l: "Total Cholesterol",    min: 100,max: 400, step: 1,   unit: "mg/dL" },
    { k: "ldl",              l: "LDL Cholesterol",      min: 50, max: 300, step: 1,   unit: "mg/dL" },
    { k: "hdl",              l: "HDL Cholesterol",      min: 20, max: 100, step: 1,   unit: "mg/dL" },
    { k: "egfr",             l: "eGFR (Kidney Function)",min: 10, max: 150, step: 1,  unit: "mL/min" },
    { k: "alt",              l: "ALT (Liver Enzyme)",    min: 5,  max: 200, step: 1,   unit: "U/L" },
    { k: "alcohol_units_week",l:"Weekly Alcohol Intake",min: 0,  max: 50,  step: 1,   unit: "units" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Predictive Disease Prevention & Monitoring Engine"
        subtitle="12-month longitudinal disease trajectory modeling and modifiable risk factor reduction"
        icon={Shield}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Metrics Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 max-h-[82vh] overflow-y-auto">
          <h2 className="text-slate-900 font-bold text-sm sticky top-0 bg-white pb-2 border-b border-slate-100">Patient Biometric Metrics</h2>
          {SLIDERS.map(({ k, l, min, max, step, unit }) => (
            <div key={k} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">{l}</label>
                <span className="font-mono font-bold text-blue-700">{(form as any)[k]} {unit}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step}
                value={(form as any)[k]}
                onChange={e => set(k, parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 mb-2 block">Weekly Exercise Frequency (Days)</label>
            <div className="flex gap-1.5 flex-wrap">
              {[0,1,2,3,4,5,6,7].map(d => (
                <button
                  key={d}
                  onClick={() => set("exercise_days_per_week", d)}
                  className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${
                    form.exercise_days_per_week === d
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {[
              { k: "smoking",               l: "Current Tobacco Smoker" },
              { k: "family_diabetes",       l: "Family History: Type 2 Diabetes", fh: true, fhk: "diabetes" },
              { k: "family_heart_disease",  l: "Family History: Cardiovascular Disease", fh: true, fhk: "heart_disease" },
            ].map(({ k, l, fh, fhk }) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fh ? (form.family_history as any)[fhk!] : (form as any)[k]}
                  onChange={e => fh ? setFH(fhk!, e.target.checked) : set(k, e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span className="text-xs font-medium text-slate-700">{l}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            {loading ? <><Loader size={14} className="animate-spin" /> Modeling Risk Trajectory...</> : "Execute Prevention Engine →"}
          </button>

          {error && <AlertBanner variant="error" message={error} />}
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Score Header */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Prevention Health Score</p>
                  <div className="text-4xl font-extrabold text-slate-900">
                    {result.overall_prevention_score}<span className="text-sm font-normal text-slate-400">/100</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Higher score indicates lower risk profile</p>
                </div>
                <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Identified Risk</p>
                  <Badge variant="danger" size="md">{result.top_risk}</Badge>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Modifiable risk factors: {result.xai_summary?.modifiable_risk_count}</p>
                </div>
              </div>

              {/* Immediate Actions */}
              {(result.xai_summary?.immediate_actions || []).length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs space-y-2">
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-amber-600" /> Immediate Preventive Directives
                  </h3>
                  <div className="space-y-1">
                    {result.xai_summary.immediate_actions.map((a: string, i: number) => (
                      <div key={i} className="text-xs text-amber-900 flex items-start gap-2 font-medium">
                        <span className="font-bold text-amber-700">{i+1}.</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disease Breakdown */}
              {(result.diseases || []).map((d: any) => (
                <div key={d.disease} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <button
                    onClick={() => setExpanded(expanded === d.disease ? null : d.disease)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{d.icon}</span>
                      <div>
                        <p className="text-slate-900 font-bold text-sm">{d.disease}</p>
                        <p className="text-xs text-slate-500 font-medium">{d.stage}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-28 sm:w-36 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${d.risk_percent}%`, backgroundColor: d.color }}
                        />
                      </div>
                      <span className="text-xs font-extrabold w-10 text-right" style={{ color: d.color }}>{d.risk_percent}%</span>
                      {expanded === d.disease ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </div>
                  </button>

                  {expanded === d.disease && (
                    <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contributing Risk Factors</p>
                        <div className="space-y-1.5">
                          {(d.contributing_factors || []).map((f: any, i: number) => (
                            <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs">
                              <span className="font-medium text-slate-800">{f.factor}</span>
                              <Badge variant={FACTOR_STATUS[f.status] || "neutral"} size="sm">+{f.weight} Weight</Badge>
                            </div>
                          ))}
                          {d.contributing_factors.length === 0 && (
                            <p className="text-xs text-emerald-700 flex items-center gap-1.5 font-semibold">
                              <CheckCircle size={13} /> No elevated risk factors identified
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Targeted Preventive Actions</p>
                        <div className="space-y-1.5">
                          {(d.preventive_actions || []).map((a: string, i: number) => (
                            <div key={i} className="text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 flex items-start gap-2 font-medium">
                              <CheckCircle size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center py-24 px-4 text-center">
              <Shield size={40} className="text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">Configure health metrics and click Execute Prevention Engine</p>
              <p className="text-[11px] text-slate-500 mt-1">Calculates 5-disease risk trajectory models with actionable preventive protocols</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
