import { useEffect, useState } from "react";
import { useAuth } from "../App";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import {
  FileText, MessageSquare, ScanLine, AlertTriangle,
  Zap, Bot, Siren, Heart, Activity, Pill, Calendar, ChevronRight
} from "lucide-react";

const STAT_COLORS: Record<string, { card: string; icon: string; iconBg: string }> = {
  blue:   { card: "from-blue-600/20 to-blue-900/10 border-blue-500/20",   icon: "text-blue-400",   iconBg: "bg-blue-500/10" },
  purple: { card: "from-purple-600/20 to-purple-900/10 border-purple-500/20", icon: "text-purple-400", iconBg: "bg-purple-500/10" },
  amber:  { card: "from-amber-600/20 to-amber-900/10 border-amber-500/20",  icon: "text-amber-400",  iconBg: "bg-amber-500/10" },
  green:  { card: "from-green-600/20 to-green-900/10 border-green-500/20",  icon: "text-green-400",  iconBg: "bg-green-500/10" },
  red:    { card: "from-red-600/20 to-red-900/10 border-red-500/20",     icon: "text-red-400",    iconBg: "bg-red-500/10" },
  cyan:   { card: "from-cyan-600/20 to-cyan-900/10 border-cyan-500/20",   icon: "text-cyan-400",   iconBg: "bg-cyan-500/10" },
};

const QA_COLORS: Record<string, string> = {
  cyan:   "hover:border-cyan-500/40 hover:bg-cyan-500/5",
  purple: "hover:border-purple-500/40 hover:bg-purple-500/5",
  orange: "hover:border-orange-500/40 hover:bg-orange-500/5",
  red:    "hover:border-red-500/40 hover:bg-red-500/5",
  teal:   "hover:border-teal-500/40 hover:bg-teal-500/5",
  pink:   "hover:border-pink-500/40 hover:bg-pink-500/5",
  blue:   "hover:border-blue-500/40 hover:bg-blue-500/5",
  indigo: "hover:border-indigo-500/40 hover:bg-indigo-500/5",
};

function StatCard({ label, value, icon: Icon, color, sub, onClick }: any) {
  const c = STAT_COLORS[color] || STAT_COLORS.blue;
  return (
    <button onClick={onClick}
      className={`bg-gradient-to-br ${c.card} border rounded-2xl p-4 text-left w-full transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg group`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.iconBg}`}>
          <Icon size={18} className={c.icon} />
        </div>
        <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs font-semibold text-white/80 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </button>
  );
}

function QuickAction({ label, icon: Icon, path, color, desc, onClick }: any) {
  const c = QA_COLORS[color] || "";
  return (
    <button onClick={onClick}
      className={`flex flex-col items-start gap-2 p-4 bg-gray-900 border border-gray-800 rounded-2xl transition-all group w-full ${c}`}>
      <Icon size={18} className="text-gray-500 group-hover:text-white transition-colors" />
      <div>
        <p className="text-xs font-semibold text-white">{label}</p>
        {desc && <p className="text-xs text-gray-600 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [copilot, setCopilot] = useState<any>(null);

  useEffect(() => {
    console.log(`[Auth Audit] 9. Dashboard rendered timestamp=${performance.now().toFixed(2)}ms`);
    const load = async () => {
      try {
        const [reports, images, risks, meds, appts] = await Promise.allSettled([
          api.getReports(), api.getImages(), api.getRiskHistory(),
          api.getMedications(), api.getAppointments(),
        ]);
        setData({
          reports: reports.status === "fulfilled" ? reports.value : [],
          images: images.status === "fulfilled" ? images.value : [],
          risks: risks.status === "fulfilled" ? risks.value : [],
          meds: meds.status === "fulfilled" ? meds.value : [],
          appts: appts.status === "fulfilled" ? appts.value : [],
        });
      } catch {}

      setLoading(false);
    };
    load();
  }, []);

  const latestRisk = data.risks?.slice(-1)[0];
  const riskColors: Record<string, string> = {
    "Low Risk": "text-green-400 bg-green-400/10",
    "Moderate Risk": "text-amber-400 bg-amber-400/10",
    "High Risk": "text-red-400 bg-red-400/10",
  };

  const healthScore = latestRisk
    ? Math.max(20, 100 - Object.values(latestRisk.scores).filter((v: any) => v === "High Risk").length * 25
        - Object.values(latestRisk.scores).filter((v: any) => v === "Moderate Risk").length * 10)
    : null;

  const scoreColor = healthScore == null ? "text-gray-500"
    : healthScore >= 80 ? "text-green-400"
    : healthScore >= 60 ? "text-amber-400"
    : "text-red-400";

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Welcome back, {user?.name?.split(" ")[0] || "User"} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {healthScore != null && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-2 text-center">
              <div className={`text-2xl font-black ${scoreColor}`}>{healthScore}</div>
              <div className="text-xs text-gray-500">Health Score</div>
            </div>
          )}
          <button onClick={() => navigate("/command-center")}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20">
            <Zap size={14} /> Run Full Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Reports" value={loading ? "—" : data.reports?.length ?? 0} icon={FileText} color="blue" sub="Uploaded" onClick={() => navigate("/reports")} />
        <StatCard label="Scans" value={loading ? "—" : data.images?.length ?? 0} icon={ScanLine} color="purple" sub="Analyzed" onClick={() => navigate("/imaging")} />
        <StatCard label="Risk Checks" value={loading ? "—" : data.risks?.length ?? 0} icon={AlertTriangle} color="amber" sub="Assessments" onClick={() => navigate("/risk")} />
        <StatCard label="Medications" value={loading ? "—" : data.meds?.length ?? 0} icon={Pill} color="green" sub="Active" onClick={() => navigate("/medications")} />
        <StatCard label="Appointments" value={loading ? "—" : data.appts?.length ?? 0} icon={Calendar} color="cyan" sub="Scheduled" onClick={() => navigate("/appointments")} />
        <StatCard label="AI Chat" value="∞" icon={MessageSquare} color="red" sub="Available 24/7" onClick={() => navigate("/chat")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-white text-sm flex items-center gap-2"><FileText size={14} className="text-blue-400" /> Recent Reports</h2>
            <button onClick={() => navigate("/reports")} className="text-xs text-blue-400 hover:underline">View All →</button>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />)}</div>
          ) : (data.reports?.length ?? 0) === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No reports uploaded yet.</p>
              <button onClick={() => navigate("/reports")} className="mt-2 text-xs text-blue-400 hover:underline">Upload first report →</button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.reports.slice(-5).reverse().map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={13} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">{r.filename}</p>
                    <p className="text-xs text-gray-500">{r.file_type} · {r.upload_date}</p>
                  </div>
                  <button onClick={() => window.open(api.downloadPdf(r.id), "_blank")}
                    className="text-xs text-blue-400 border border-blue-400/20 px-2 py-1 rounded-lg hover:bg-blue-400/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">
                    PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-white text-sm flex items-center gap-2"><Heart size={14} className="text-red-400" /> Risk Scores</h2>
              <button onClick={() => navigate("/risk")} className="text-xs text-blue-400 hover:underline">Assess →</button>
            </div>
            {latestRisk ? (
              <div className="space-y-2">
                {Object.entries(latestRisk.scores).map(([k, v]: any) => (
                  <div key={k} className="flex justify-between items-center p-2.5 bg-gray-800/60 rounded-xl">
                    <span className="text-xs text-gray-400">{k}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskColors[v] || "text-gray-400 bg-gray-800"}`}>{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle size={24} className="text-gray-700 mx-auto mb-1" />
                <p className="text-xs text-gray-600">No risk assessments yet</p>
                <button onClick={() => navigate("/risk")} className="mt-1 text-xs text-blue-400 hover:underline">Start →</button>
              </div>
            )}
          </div>

          {copilot && (
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-white text-sm flex items-center gap-2"><Bot size={14} className="text-indigo-400" /> AI Copilot</h2>
                <button onClick={() => navigate("/health-copilot")} className="text-xs text-indigo-400 hover:underline">Full Brief →</button>
              </div>
              {copilot.daily_health_tip && (
                <p className="text-xs text-gray-300 leading-relaxed mb-2 bg-indigo-500/10 p-2.5 rounded-lg">
                  💡 {copilot.daily_health_tip}
                </p>
              )}
              {copilot.exercise && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Activity size={11} className="text-green-400" />
                  {copilot.exercise.type} · {copilot.exercise.duration_minutes} min
                </div>
              )}
              {copilot.hydration && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span className="text-cyan-400">💧</span>
                  Goal: {copilot.hydration.goal_liters}L today
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(data.appts?.length ?? 0) > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-white text-sm flex items-center gap-2"><Calendar size={14} className="text-cyan-400" /> Upcoming Appointments</h2>
            <button onClick={() => navigate("/appointments")} className="text-xs text-blue-400 hover:underline">Manage →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.appts.slice(0, 3).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/20 flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">Dr. {a.doctor}</p>
                  <p className="text-xs text-gray-500">{a.specialty} · {a.date} {a.time}</p>
                  <span className="text-xs text-green-400 font-medium">{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-white font-bold text-sm mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Emergency Triage",   icon: Siren,       path: "/emergency-triage",  color: "red",    desc: "Symptom risk check" },
            { label: "Upload Report",      icon: FileText,    path: "/reports",           color: "blue",   desc: "PDF / DOCX / TXT" },
            { label: "Command Center",     icon: Zap,         path: "/command-center",    color: "indigo", desc: "Full pipeline" },
          ].map(({ path, ...props }) => <QuickAction key={path} {...props} onClick={() => navigate(path)} />)}
        </div>
      </div>
    </div>
  );
}
