import { useState } from "react";
import { api } from "../api";
import { BarChart2, Loader } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from "recharts";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";

const DISEASES = [
  { id: "diabetes",     label: "Diabetes",     color: "#2563eb" },
  { id: "hypertension", label: "Hypertension", color: "#dc2626" },
  { id: "obesity",      label: "Obesity",      color: "#9333ea" },
  { id: "heart_disease",label: "Heart Disease",color: "#ea580c" },
];

const INDIA_STATES_SHORT = [
  "All India","Maharashtra","Delhi","Tamil Nadu","Karnataka",
  "Uttar Pradesh","West Bengal","Rajasthan","Gujarat","Bihar",
];

export default function PopulationAnalytics() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [disease, setDisease] = useState("diabetes");
  const [state, setState] = useState("All India");
  const [activeView, setActiveView] = useState<"districts" | "trend" | "age">("districts");

  const handleLoad = async () => {
    setLoading(true);
    try {
      const res = await api.populationAnalytics(state, disease);
      setData(res);
    } catch { }
    finally { setLoading(false); }
  };

  const cfg = DISEASES.find(d => d.id === disease)!;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Epidemiological Population Health Analytics"
        subtitle="District-level disease prevalence surveillance, 10-year epidemiological trend lines, and demographic risk strata"
        icon={BarChart2}
      />

      {/* Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Disease Surveillance Focus</label>
          <div className="flex gap-1.5">
            {DISEASES.map(d => (
              <button
                key={d.id}
                onClick={() => setDisease(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  disease === d.id
                    ? "bg-blue-600 border-blue-700 text-white shadow-2xs"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Geographic Jurisdiction</label>
          <select
            value={state} onChange={e => setState(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
          >
            {INDIA_STATES_SHORT.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <button
          onClick={handleLoad} disabled={loading}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
        >
          {loading ? <><Loader size={14} className="animate-spin" /> Querying Dataset...</> : "Load Epidemiological Data →"}
        </button>
      </div>

      {data && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <div className="text-2xl font-extrabold text-slate-900">{data.national_prevalence}%</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">National Prevalence Rate</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <div className="text-2xl font-extrabold text-red-600">{data.district_data?.filter((d: any) => d.risk_level === "High").length}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">High-Risk Districts</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <div className="text-2xl font-extrabold text-amber-600">{data.district_data?.length}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Surveillance Districts</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <div className="text-2xl font-extrabold text-emerald-600">
                {data.trend_data?.[data.trend_data.length - 1]?.prevalence}%
              </div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Current Rate (2024)</div>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex gap-2">
            {[
              { id: "districts", label: "District Prevalence Bar Chart" },
              { id: "trend",     label: "10-Year Longitudinal Trend" },
              { id: "age",       label: "Demographic Age Breakdown" },
            ].map(({ id, label }) => (
              <button
                key={id} onClick={() => setActiveView(id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  activeView === id
                    ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Chart Container */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            {activeView === "districts" && (
              <>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-slate-900 font-bold text-sm">District-Level {cfg.label} Prevalence (%)</h3>
                  <Badge variant="info" size="sm">NFHS-5 Data</Badge>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.district_data} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="district" tick={{ fill: "#64748b", fontSize: 10 }} angle={-45} textAnchor="end" />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(v: any) => [`${v}%`, "Prevalence"]} />
                    <Bar dataKey="prevalence_pct" radius={[4, 4, 0, 0]}>
                      {data.district_data.map((d: any, i: number) => (
                        <Cell key={i} fill={d.color || cfg.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
            {activeView === "trend" && (
              <>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-slate-900 font-bold text-sm">{cfg.label} Prevalence Trend Line (2015–2024)</h3>
                  <Badge variant="neutral" size="sm">Longitudinal</Badge>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.trend_data}>
                    <defs>
                      <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cfg.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="prevalence" stroke={cfg.color} fill="url(#popGrad)" strokeWidth={2.5} name={`${cfg.label} %`} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
            {activeView === "age" && (
              <>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-slate-900 font-bold text-sm">{cfg.label} Stratification by Age Cohort</h3>
                  <Badge variant="warning" size="sm">Demographic</Badge>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.age_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="age_group" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(v: any) => [`${v}%`, "Prevalence"]} />
                    <Bar dataKey="prevalence" fill={cfg.color} radius={[4, 4, 0, 0]} name="Prevalence %" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

          {/* Key Insights */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-slate-900 font-bold text-sm mb-3">📊 Key Epidemiological Insights</h3>
            <div className="space-y-2">
              {(data.insights || []).map((insight: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 italic">
              Data compiled from ICMR & NFHS-5 surveillance surveys with district-level statistical modeling.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
