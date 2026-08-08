import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  LayoutDashboard, FileText, MessageSquare, ScanLine,
  Activity, HeartPulse, LogOut, Activity as Brain, Zap, Shield,
  Languages, MapPin, IndianRupee, BarChart2, GraduationCap,
  ChevronDown, ChevronRight, Siren, Compass
} from "lucide-react";

interface NavItem { path: string; icon: any; label: string; }

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { path: "/dashboard",        icon: LayoutDashboard, label: "Dashboard" },
      { path: "/command-center",   icon: Zap,             label: "Command Center" },
    ]
  },
  {
    label: "Healthcare Platform",
    items: [
      { path: "/prevention-engine",    icon: Shield,       label: "Prevention Engine" },
      { path: "/voice-assistant",      icon: Languages,    label: "Voice Assistant" },
      { path: "/rural-worker",         icon: MapPin,       label: "ASHA Rural Mode" },
      { path: "/affordability",        icon: IndianRupee,  label: "Affordability Engine" },
      { path: "/population-analytics", icon: BarChart2,    label: "Population Analytics" },
      { path: "/medical-educator",     icon: GraduationCap,label: "Medical Educator" },
    ]
  },
  {
    label: "Diagnostics",
    items: [
      { path: "/reports",           icon: FileText,      label: "Reports" },
      { path: "/imaging",           icon: ScanLine,      label: "Medical Imaging" },
      { path: "/symptoms",          icon: Activity,      label: "Symptom Checker" },
    ]
  },
  {
    label: "Emergency",
    items: [
      { path: "/emergency-triage",  icon: Siren,         label: "Emergency Triage" },
    ]
  },
  {
    label: "Advanced AI",
    items: [
      { path: "/chat",              icon: MessageSquare, label: "AI Assistant" },
      { path: "/drug-interactions", icon: HeartPulse,   label: "Drug Interactions" },
    ]
  },
  {
    label: "Care Locator",
    items: [
      { path: "/healthcare-finder", icon: Compass, label: "Hospitals & Labs" },
    ]
  },
];

function NavGroup({ group, defaultOpen = true }: { group: typeof NAV_GROUPS[0]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
      >
        <span>{group.label}</span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <div className="space-y-0.5 mt-1">
          {group.items.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                }`
              }
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen select-none">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">CareAI</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Healthcare v4.0</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV_GROUPS.map((g, i) => (
          <NavGroup key={g.label} group={g} defaultOpen={i < 3 || i === NAV_GROUPS.length - 1} />
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 mb-2 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">{user?.name || "Healthcare User"}</div>
            <div className="text-[11px] text-slate-500 truncate">{user?.email || ""}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200 hover:border-red-200"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
