import { useState } from "react";
import { api } from "../api";
import { Shield, Loader, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from "lucide-react";

const FACTOR_STATUS: Record<string, string> = {
  critical: "bg-red-500/10 border-red-500/30 text-red-400",
  warning:  "bg-amber-500/10 border-amber-500/30 text-amber-400",
  info:     "bg-blue-500/10 border-blue-500/30 text-blue-400",
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
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const SLIDERS = [
    { k: "age",              l: "Age",                  min: 18, max: 90,  step: 1,   unit: "years" },
    { k: "bmi",              l: "BMI",                  min: 16, max: 50,  step: 0.1, unit: "kg/m²" },
    { k: "glucose",          l: "Fasting Glucose",      min: 60, max: 300, step: 1,   unit: "mg/dL" },
    { k: "hba1c",            l: "HbA1c",                min: 4,  max: 13,  step: 0.1, unit: "%" },
    { k: "systolic_bp",      l: "Systolic BP",          min: 90, max: 200, step: 1,   unit: "mmHg" },
    { k: "total_cholesterol",l: "Total Cholesterol",    min: 100,max: 400, step: 1,   unit: "mg/dL" },
    { k: "ldl",              l: "LDL Cholesterol",      min: 50, max: 300, step: 1,   unit: "mg/dL" },
    { k: "hdl",              l: "HDL Cholesterol",      min: 20, max: 100, step: 1,   unit: "mg/dL" },
    { k: "egfr",             l: "eGFR (Kidney)",        min: 10, max: 150, step: 1,   unit: "mL/min" },
    { k: "alt",              l: "ALT (Liver)",           min: 5,  max: 200, step: 1,   unit: "U/L" },
    { k: "alcohol_units_week",l:"Alcohol Units/Week",   min: 0,  max: 50,  step: 1,   unit: "units" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Disease Prevention Engine</h1>
          <p className="text-sm text-gray-500">Early risk detection and preventive 12-month health trajectory modeling</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          <h2 className="text-white font-semibold text-sm sticky top-0 bg-gray-900 pb-2">Health Metrics</h2>
          {SLIDERS.map(({ k, l, min, max, step, unit }) => (
            <div key={k}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-500">{l}</label>
                <span className="text-xs text-green-400 font-medium">{(form as any)[k]} {unit}</span>
              </div>
              <input type="range" min={min} max={max} step={step}
                value={(form as any)[k]}
                onChange={e => set(k, parseFloat(e.target.value))}
                className="w-full accent-green-500 cursor-pointer" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Exercise Days / Week</label>
            <div className="flex gap-1.5 flex-wrap">
              {[0,1,2,3,4,5,6,7].map(d => (
                <button key={d} onClick={() => set("exercise_days_per_week", d)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${form.exercise_days_per_week === d ? "bg-green-600 text-white" : "bg-gray-800 text-gray-500"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {[
              { k: "smoking",               l: "Smoker" },
              { k: "family_diabetes",       l: "Family: Diabetes",      fh: true, fhk: "diabetes" },
              { k: "family_heart_disease",  l: "Family: Heart Disease", fh: true, fhk: "heart_disease" },
            ].map(({ k, l, fh, fhk }) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={fh ? (form.family_history as any)[fhk!] : (form as any)[k]}
                  onChange={e => fh ? setFH(fhk!, e.target.checked) : set(k, e.target.checked)}
                  className="w-4 h-4 accent-green-500" />
                <span className="text-xs text-gray-400">{l}</span>
              </label>
            ))}
          </div>
          <button onClick={handleAnalyze} disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
            {loading ? <><Loader size={14} className="animate-spin" /> Analyzing...</> : "Run Prevention Engine →"}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {}
              <div className="bg-gradient-to-r from-gray-900 to-green-900/20 border border-green-500/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Overall Prevention Score</p>
                  <div className="text-4xl font-black text-white">{result.overall_prevention_score}<span className="text-lg text-gray-500">/100</span></div>
                  <p className="text-xs text-gray-500 mt-1">Higher = better prevention status</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Top Risk</p>
                  <p className="text-sm font-bold text-red-400">{result.top_risk}</p>
                  <p className="text-xs text-gray-600 mt-2">Modifiable risks: {result.xai_summary?.modifiable_risk_count}</p>
                </div>
              </div>

              {}
              <div className="bg-gray-900 border border-amber-500/20 rounded-2xl p-4">
                <h3 className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Immediate Actions Required</h3>
                <ul className="space-y-1.5">
                  {(result.xai_summary?.immediate_actions || []).map((a: string, i: number) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold mt-0.5">{i+1}.</span> {a}
                    </li>
                  ))}
                </ul>
              </div>

              {}
              {(result.diseases || []).map((d: any) => (
                <div key={d.disease} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <button onClick={() => setExpanded(expanded === d.disease ? null : d.disease)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{d.icon}</span>
                      <div className="text-left">
                        <p className="text-white font-semibold text-sm">{d.disease}</p>
                        <p className="text-xs text-gray-500">{d.stage}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {}
                      <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${d.risk_percent}%`, backgroundColor: d.color }} />
                      </div>
                      <span className="text-sm font-bold w-12 text-right" style={{ color: d.color }}>{d.risk_percent}%</span>
                      <span className="text-xs text-gray-600">{d.confidence}% conf.</span>
                      {expanded === d.disease ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                    </div>
                  </button>

                  {expanded === d.disease && (
                    <div className="px-4 pb-4 space-y-3">
                      {}
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-2">Contributing Factors</p>
                        <div className="space-y-1.5">
                          {(d.contributing_factors || []).map((f: any, i: number) => (
                            <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${FACTOR_STATUS[f.status]}`}>
                              <span>{f.factor}</span>
                              <span className="font-bold ml-2">+{f.weight}</span>
                            </div>
                          ))}
                          {d.contributing_factors.length === 0 && (
                            <p className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle size={12} className="text-green-500" /> No significant risk factors detected</p>
                          )}
                        </div>
                      </div>
                      {}
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-2">Preventive Actions</p>
                        <ul className="space-y-1">
                          {(d.preventive_actions || []).map((a: string, i: number) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                              <CheckCircle size={11} className="text-green-500 flex-shrink-0 mt-0.5" /> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center py-24 gap-3">
              <Shield size={48} className="text-gray-700" />
              <p className="text-gray-600">Configure your health metrics and run the prevention engine</p>
              <p className="text-gray-700 text-xs">5 diseases · Explainable AI · Preventive action plans</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
