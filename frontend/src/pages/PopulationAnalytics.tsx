import { useState } from "react";
import { api } from "../api";
import { BarChart2, Loader } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, Cell
} from "recharts";

const DISEASES = [
  { id: "diabetes",     label: "Diabetes",     color: "#f59e0b" },
  { id: "hypertension", label: "Hypertension", color: "#ef4444" },
  { id: "obesity",      label: "Obesity",      color: "#8b5cf6" },
  { id: "heart_disease",label: "Heart Disease",color: "#dc2626" },
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
    } catch {  }
    finally { setLoading(false); }
  };

  const cfg = DISEASES.find(d => d.id === disease)!;

  const CustomBar = (props: any) => {
    const { x, y, width, height, color } = props;
    return <rect x={x} y={y} width={width} height={height} fill={color} rx={3} />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
          <BarChart2 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Population Health Analytics</h1>
          <p className="text-sm text-gray-500">Regional epidemiological disease prevalence and public health analytics</p>
        </div>
      </div>

      {}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Disease</label>
          <div className="flex gap-2">
            {DISEASES.map(d => (
              <button key={d.id} onClick={() => setDisease(d.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${disease === d.id ? "text-white border-transparent" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"}`}
                style={disease === d.id ? { backgroundColor: d.color, borderColor: d.color } : {}}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">State/Region</label>
          <select value={state} onChange={e => setState(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" style={{ borderColor: data ? cfg.color + "60" : undefined }}>
            {INDIA_STATES_SHORT.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={handleLoad} disabled={loading}
          className="px-5 py-2 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
          style={{ backgroundColor: cfg.color }}>
          {loading ? <><Loader size={14} className="animate-spin" /> Loading...</> : "Load Analytics →"}
        </button>
      </div>

      {data && (
        <>
          {}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">{data.national_prevalence}%</div>
              <div className="text-xs text-gray-500">National Prevalence</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black" style={{ color: cfg.color }}>{data.district_data?.filter((d: any) => d.risk_level === "High").length}</div>
              <div className="text-xs text-gray-500">High-Risk Districts</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-amber-400">{data.district_data?.length}</div>
              <div className="text-xs text-gray-500">Districts Tracked</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-green-400">
                {data.trend_data?.[data.trend_data.length - 1]?.prevalence}%
              </div>
              <div className="text-xs text-gray-500">2024 Prevalence</div>
            </div>
          </div>

          {}
          <div className="flex gap-2">
            {[
              { id: "districts", label: "District Map" },
              { id: "trend",     label: "Trend 2015-2024" },
              { id: "age",       label: "Age Breakdown" },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setActiveView(id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeView === id ? "text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-750"}`}
                style={activeView === id ? { backgroundColor: cfg.color } : {}}>
                {label}
              </button>
            ))}
          </div>

          {}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            {activeView === "districts" && (
              <>
                <h3 className="text-white font-semibold text-sm mb-4">District-Level {cfg.label} Prevalence (%)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.district_data} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="district" tick={{ fill: "#6b7280", fontSize: 10 }} angle={-45} textAnchor="end" />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }}
                      formatter={(v: any) => [`${v}%`, "Prevalence"]} />
                    <Bar dataKey="prevalence_pct" radius={[4, 4, 0, 0]}>
                      {data.district_data.map((d: any, i: number) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
            {activeView === "trend" && (
              <>
                <h3 className="text-white font-semibold text-sm mb-4">{cfg.label} Prevalence Trend (2015–2024)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.trend_data}>
                    <defs>
                      <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="year" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="prevalence" stroke={cfg.color} fill="url(#popGrad)" strokeWidth={2.5} name={`${cfg.label} %`} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
            {activeView === "age" && (
              <>
                <h3 className="text-white font-semibold text-sm mb-4">{cfg.label} by Age Group</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.age_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="age_group" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }}
                      formatter={(v: any) => [`${v}%`, "Prevalence"]} />
                    <Bar dataKey="prevalence" fill={cfg.color} radius={[4, 4, 0, 0]} name="Prevalence %" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

          {}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">📊 Key Insights</h3>
            <ul className="space-y-2">
              {(data.insights || []).map((insight: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span style={{ color: cfg.color }} className="font-bold flex-shrink-0 mt-0.5">•</span> {insight}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-600 mt-3 italic">Data based on ICMR/NFHS-5 (2019-21) statistics with district-level modelling. For research use.</p>
          </div>
        </>
      )}
    </div>
  );
}
