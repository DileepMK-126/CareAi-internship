import { useState } from "react";
import { api } from "../api";
import { IndianRupee, Loader, CheckCircle, ExternalLink, Building2, Pill } from "lucide-react";

const INDIA_STATES = [
  "Andhra Pradesh","Assam","Bihar","Delhi","Gujarat","Haryana","Himachal Pradesh",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan",
  "Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal",
];

const CONDITIONS = [
  "Diabetes","Hypertension","Heart Disease","Kidney Disease","Cancer",
  "Asthma","Thyroid","Arthritis","Depression","Stroke","COPD","Obesity",
];

export default function AffordabilityEngine() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [condition, setCondition] = useState("Diabetes");
  const [state, setState] = useState("Maharashtra");
  const [severity, setSeverity] = useState("Moderate");

  const handleEstimate = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.affordabilityEstimate({ condition, state, severity });
      setResult(res);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center">
          <IndianRupee size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Healthcare Affordability Engine</h1>
          <p className="text-sm text-gray-500">Treatment cost estimation, PM-JAY government schemes, and generic drug alternatives</p>
        </div>
      </div>

      {}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Condition / Disease</label>
            <select value={condition} onChange={e => setCondition(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500">
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Your State</label>
            <select value={state} onChange={e => setState(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500">
              {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Severity</label>
            <div className="flex gap-2">
              {["Mild","Moderate","Severe","Critical"].map(s => (
                <button key={s} onClick={() => setSeverity(s)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                    severity === s
                      ? s === "Critical" ? "bg-red-600 border-red-500 text-white"
                        : s === "Severe" ? "bg-orange-600 border-orange-500 text-white"
                        : s === "Moderate" ? "bg-amber-600 border-amber-500 text-white"
                        : "bg-green-600 border-green-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleEstimate} disabled={loading}
          className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
          {loading ? <><Loader size={14} className="animate-spin" /> Estimating...</> : "Estimate Healthcare Costs →"}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {result && (
        <div className="space-y-4">
          {}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Consultation/Visit", val: result.estimated_costs?.consultation_per_visit, color: "blue" },
              { label: "Monthly Medications", val: result.estimated_costs?.monthly_medications, color: "purple" },
              { label: "Est. Annual Total",   val: result.estimated_costs?.estimated_annual_total, color: "amber" },
              { label: "With PM-JAY Savings", val: result.estimated_costs?.with_pmjay_savings, color: "green" },
            ].map(({ label, val, color }) => {
              const colorMap: Record<string, string> = {
                blue: "from-blue-900/30 border-blue-500/20 text-blue-400",
                purple: "from-purple-900/30 border-purple-500/20 text-purple-400",
                amber: "from-amber-900/30 border-amber-500/20 text-amber-400",
                green: "from-green-900/30 border-green-500/20 text-green-400",
              };
              return (
                <div key={label} className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-black ${colorMap[color].split(" ")[2]}`}>₹{(val || 0).toLocaleString("en-IN")}</p>
                </div>
              );
            })}
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-500/20 rounded-2xl p-4">
              <p className="text-xs text-green-400 font-semibold mb-1">🏥 Government Hospital Savings</p>
              <p className="text-sm text-white">{result.private_vs_govt_savings}</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-4">
              <p className="text-xs text-blue-400 font-semibold mb-1">💊 Jan Aushadhi Generic Savings</p>
              <p className="text-sm text-white">{result.jan_aushadhi_savings}</p>
            </div>
          </div>

          {}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Building2 size={14} className="text-amber-400" /> Eligible Government Schemes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(result.eligible_schemes || []).map((scheme: any, i: number) => (
                <div key={i} className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                  <p className="text-sm font-semibold text-white mb-1">{scheme.name}</p>
                  <p className="text-xs text-amber-400 mb-1">Coverage: {scheme.coverage}</p>
                  <p className="text-xs text-gray-500 mb-2">Eligible: {scheme.eligible}</p>
                  <a href={`https://${scheme.url}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                    <ExternalLink size={10} /> {scheme.url}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Pill size={14} className="text-green-400" /> Generic / Affordable Alternatives
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{result.affordable_alternatives}</p>
          </div>

          {}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-400 text-xs font-semibold mb-2">Nearest Resources</h3>
            <ul className="space-y-1.5">
              {(result.nearest_resources || []).map((r: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle size={11} className="text-green-500 flex-shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
