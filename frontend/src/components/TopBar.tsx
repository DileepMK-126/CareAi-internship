import { Bell, Search, Settings, Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard":          "Dashboard",
  "/command-center":     "Clinical Command Center",
  "/reports":            "Medical Reports",
  "/imaging":            "Medical Imaging Diagnostics",
  "/symptoms":           "Clinical Symptom Checker",
  "/drug-interactions":  "Drug Interactions Analyzer",
  "/prescriptions":      "Prescription OCR Scanner",
  "/chat":               "Clinical AI Assistant",
  "/prevention-engine":  "Prevention & Risk Engine",
  "/emergency-triage":   "Emergency Triage Protocol",
  "/population-analytics": "Population Health Analytics",
  "/affordability":      "Affordability & Cost Engine",
  "/rural-worker":       "ASHA Rural Health Worker",
  "/healthcare-finder":  "Care Locator & Hospitals",
  "/medical-educator":   "Medical Educator Portal",
  "/voice-assistant":    "Voice Clinical Assistant",
};

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const pageTitle = ROUTE_LABELS[location.pathname] || "CareAI";
  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "U";
  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-6 gap-4 justify-between sticky top-0 z-10 shadow-2xs">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span className="hidden sm:inline-block text-xs font-medium text-slate-500">{today}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-60 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search patient, reports, tests..."
            className="bg-transparent text-xs outline-none text-slate-800 placeholder-slate-400 w-full font-medium"
            aria-label="Search"
          />
        </div>

        <button
          aria-label="Notifications"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors relative border border-transparent hover:border-slate-200"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
        </button>

        <button
          aria-label="Settings"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <Settings size={15} />
        </button>

        <button
          onClick={() => navigate("/command-center")}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          aria-label="Run Clinical Analysis"
        >
          <Zap size={13} />
          <span>Full Pipeline</span>
        </button>

        <div
          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 cursor-pointer shadow-xs border border-blue-700"
          title={user?.name || "User Profile"}
          aria-label="User profile"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
