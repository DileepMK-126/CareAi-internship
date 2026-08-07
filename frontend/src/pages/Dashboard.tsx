import { useEffect, useState } from "react";
import { useAuth } from "../App";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import {
  FileText, MessageSquare, ScanLine, AlertTriangle,
  Zap, Bot, Siren, Heart, Activity, Pill, ChevronRight, FileDown, ArrowUpRight
} from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [copilot, setCopilot] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [reports, images, risks, meds] = await Promise.allSettled([
          api.getReports(), api.getImages(), api.getRiskHistory(),
          api.getMedications(),
        ]);
        setData({
          reports: reports.status === "fulfilled" ? reports.value : [],
          images: images.status === "fulfilled" ? images.value : [],
          risks: risks.status === "fulfilled" ? risks.value : [],
          meds: meds.status === "fulfilled" ? meds.value : [],
        });
      } catch {}

      setLoading(false);
    };
    load();
  }, []);

  const latestRisk = data.risks?.slice(-1)[0];
  const riskBadges: Record<string, "success" | "warning" | "danger"> = {
    "Low Risk": "success",
    "Moderate Risk": "warning",
    "High Risk": "danger",
  };

  const healthScore = latestRisk
    ? Math.max(20, 100 - Object.values(latestRisk.scores).filter((v: any) => v === "High Risk").length * 25
        - Object.values(latestRisk.scores).filter((v: any) => v === "Moderate Risk").length * 10)
    : null;

  const scoreColor = healthScore == null ? "text-slate-400"
    : healthScore >= 80 ? "text-emerald-600"
    : healthScore >= 60 ? "text-amber-600"
    : "text-red-600";

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner & Health Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Patient Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-medium text-slate-500">{today}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Welcome back, {user?.name?.split(" ")[0] || "User"} 👋</h1>
          <p className="text-xs text-slate-500 mt-1">Here is your clinical summary and real-time health diagnostic indicators.</p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {healthScore != null && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-center min-w-[120px]">
              <div className={`text-3xl font-extrabold ${scoreColor}`}>{healthScore}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Health Index</div>
            </div>
          )}
          <button
            onClick={() => navigate("/command-center")}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            <Zap size={14} /> Run Full Diagnostic Pipeline
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Reports" value={loading ? "—" : data.reports?.length ?? 0} icon={FileText} accent="blue" sub="Clinical files uploaded" onClick={() => navigate("/reports")} />
        <StatCard label="Imaging Scans" value={loading ? "—" : data.images?.length ?? 0} icon={ScanLine} accent="purple" sub="Modality scans analyzed" onClick={() => navigate("/imaging")} />
        <StatCard label="Risk Checks" value={loading ? "—" : data.risks?.length ?? 0} icon={AlertTriangle} accent="amber" sub="Assessments completed" onClick={() => navigate("/symptoms")} />
        <StatCard label="Medications" value={loading ? "—" : data.meds?.length ?? 0} icon={Pill} accent="green" sub="Active prescriptions" onClick={() => navigate("/drug-interactions")} />
        <StatCard label="AI Assistant" value="24/7" icon={MessageSquare} accent="red" sub="Clinical LLM ready" onClick={() => navigate("/chat")} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm">Recent Clinical Reports</h2>
            </div>
            <button onClick={() => navigate("/reports")} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (data.reports?.length ?? 0) === 0 ? (
            <div className="text-center py-10 border border-slate-100 border-dashed rounded-lg">
              <FileText size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500">No medical reports uploaded yet.</p>
              <button onClick={() => navigate("/reports")} className="mt-2 text-xs font-semibold text-blue-600 hover:underline">
                Upload your first report →
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.reports.slice(-5).reverse().map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                      <FileText size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{r.filename}</p>
                      <p className="text-[11px] text-slate-500">{r.file_type || "PDF"} · {r.upload_date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(api.downloadPdf(r.id), "_blank")}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors flex-shrink-0"
                  >
                    <FileDown size={13} /> PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Scores & Copilot Column */}
        <div className="space-y-6">
          {/* Risk Scores */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-red-600" />
                <h2 className="font-bold text-slate-900 text-sm">Risk Assessment Scores</h2>
              </div>
              <button onClick={() => navigate("/symptoms")} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Assess <ChevronRight size={12} />
              </button>
            </div>

            {latestRisk ? (
              <div className="space-y-2">
                {Object.entries(latestRisk.scores).map(([k, v]: any) => (
                  <div key={k} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs font-medium text-slate-700">{k}</span>
                    <Badge variant={riskBadges[v] || "neutral"} size="sm">{v}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-slate-100 border-dashed rounded-lg">
                <AlertTriangle size={24} className="text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-slate-500">No risk assessments calculated yet</p>
                <button onClick={() => navigate("/symptoms")} className="mt-2 text-xs font-semibold text-blue-600 hover:underline">
                  Start Symptom Assessment →
                </button>
              </div>
            )}
          </div>

          {/* AI Copilot Brief */}
          {copilot && (
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-blue-600" />
                  <h2 className="font-bold text-slate-900 text-sm">AI Health Copilot Brief</h2>
                </div>
              </div>
              {copilot.daily_health_tip && (
                <p className="text-xs text-slate-700 leading-relaxed mb-3 bg-white p-3 rounded-lg border border-blue-100 font-medium">
                  💡 {copilot.daily_health_tip}
                </p>
              )}
              <div className="space-y-1.5">
                {copilot.exercise && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Activity size={13} className="text-emerald-600 flex-shrink-0" />
                    <span>Recommended: <strong className="text-slate-800">{copilot.exercise.type}</strong> ({copilot.exercise.duration_minutes} min)</span>
                  </div>
                )}
                {copilot.hydration && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-blue-500">💧</span>
                    <span>Hydration Target: <strong className="text-slate-800">{copilot.hydration.goal_liters}L daily</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">Clinical Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Emergency Triage",   icon: Siren,       path: "/emergency-triage",  badge: "High Priority", desc: "Urgent symptom assessment protocol" },
            { label: "Upload Report",      icon: FileText,    path: "/reports",           badge: "PDF / DOCX",    desc: "Ingest laboratory & pathology records" },
            { label: "Command Center",     icon: Zap,         path: "/command-center",    badge: "Full Pipeline", desc: "Run aggregate health diagnostics" },
          ].map(({ label, icon: Icon, path, badge, desc }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-start gap-2.5 p-4 bg-white border border-slate-200 rounded-xl text-left hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                  <Icon size={16} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <Badge variant="neutral" size="sm">{badge}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
