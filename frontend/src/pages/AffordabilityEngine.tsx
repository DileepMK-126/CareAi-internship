import { useState } from "react";
import { api } from "../api";
import { IndianRupee, Loader, CheckCircle, ExternalLink, Building2, Pill } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { AlertBanner } from "../components/ui/AlertBanner";

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
    } catch (e: any) { setError(e.message || "Cost estimation failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Healthcare Affordability & Cost Optimization Engine"
        subtitle="Medical cost projections, PM-JAY national insurance subsidies, and Jan Aushadhi generic drug savings"
        icon={IndianRupee}
      />

      {/* Input Selection Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Clinical Condition</label>
            <select
              value={condition} onChange={e => setCondition(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            >
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">State Jurisdiction</label>
            <select
              value={state} onChange={e => setState(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            >
              {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Pathology Severity</label>
            <div className="flex gap-1.5">
              {["Mild","Moderate","Severe","Critical"].map(s => (
                <button
                  key={s} onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${
                    severity === s
                      ? "bg-blue-600 border-blue-700 text-white shadow-2xs"
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleEstimate} disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          {loading ? <><Loader size={15} className="animate-spin" /> Calculating Cost Projections...</> : "Estimate Healthcare Costs & Subsidies →"}
        </button>

        {error && <AlertBanner variant="error" message={error} />}
      </div>

      {result && (
        <div className="space-y-6">
          {/* Estimated Cost Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Consultation / Visit", val: result.estimated_costs?.consultation_per_visit, badge: "neutral" },
              { label: "Monthly Medications", val: result.estimated_costs?.monthly_medications, badge: "info" },
              { label: "Est. Annual Outlay",   val: result.estimated_costs?.estimated_annual_total, badge: "warning" },
              { label: "With PM-JAY Savings", val: result.estimated_costs?.with_pmjay_savings, badge: "success" },
            ].map(({ label, val, badge }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                  <Badge variant={badge as any} size="sm">Estimate</Badge>
                </div>
                <p className="text-xl font-extrabold text-slate-900 mt-1">₹{(val || 0).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 size={14} className="text-emerald-600" /> Government Facility Cost Comparison
              </p>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">{result.private_vs_govt_savings}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-xs">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Pill size={14} className="text-blue-600" /> PM-BJP Jan Aushadhi Generic Savings
              </p>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">{result.jan_aushadhi_savings}</p>
            </div>
          </div>

          {/* Government Schemes */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-slate-900 font-bold text-sm mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" /> Eligible Government Healthcare Schemes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(result.eligible_schemes || []).map((scheme: any, i: number) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-900">{scheme.name}</p>
                    <Badge variant="success" size="sm">Eligible</Badge>
                  </div>
                  <p className="text-xs text-blue-700 font-medium">Coverage: {scheme.coverage}</p>
                  <p className="text-[11px] text-slate-500">{scheme.eligible}</p>
                  <a
                    href={`https://${scheme.url}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline pt-1"
                  >
                    <ExternalLink size={12} /> {scheme.url}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Generic Alternatives */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2">
              <Pill size={16} className="text-emerald-600" /> Generic Drug Substitutes
            </h3>
            <div className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3.5 leading-relaxed font-medium whitespace-pre-line">
              {result.affordable_alternatives}
            </div>
          </div>

          {/* Local Resources */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-wider mb-2.5">Nearest Assistance Facilities</h3>
            <div className="space-y-2">
              {(result.nearest_resources || []).map((r: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <CheckCircle size={13} className="text-emerald-600 flex-shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
