import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  sub?: string;
  onClick?: () => void;
  accent?: "blue" | "green" | "amber" | "red" | "purple" | "cyan" | "indigo";
  color?: string;
}

const ACCENT_STYLES: Record<string, { topBorder: string; iconBg: string; iconColor: string }> = {
  blue:   { topBorder: "border-t-blue-600",   iconBg: "bg-blue-50",   iconColor: "text-blue-600" },
  green:  { topBorder: "border-t-emerald-600", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  amber:  { topBorder: "border-t-amber-500",   iconBg: "bg-amber-50",   iconColor: "text-amber-600" },
  red:    { topBorder: "border-t-red-600",     iconBg: "bg-red-50",     iconColor: "text-red-600" },
  purple: { topBorder: "border-t-purple-600",  iconBg: "bg-purple-50",  iconColor: "text-purple-600" },
  cyan:   { topBorder: "border-t-cyan-600",    iconBg: "bg-cyan-50",    iconColor: "text-cyan-600" },
  indigo: { topBorder: "border-t-indigo-600",  iconBg: "bg-indigo-50",  iconColor: "text-indigo-600" },
};

export function StatCard({ label, value, icon: Icon, trend, sub, onClick, accent, color }: StatCardProps) {
  const selectedKey = accent || color || "blue";
  const style = ACCENT_STYLES[selectedKey] || ACCENT_STYLES.blue;
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
  const trendColor = trend?.direction === "up" ? "text-emerald-600" : trend?.direction === "down" ? "text-red-600" : "text-slate-400";

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      className={`bg-white border border-slate-200 border-t-4 ${style.topBorder} rounded-xl p-4 shadow-sm transition-all duration-200 ${
        onClick ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center`}>
          <Icon size={16} className={style.iconColor} />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-900 leading-tight">{value}</div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={12} />
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {sub && <div className="text-xs text-slate-500 mt-1 font-medium">{sub}</div>}
    </div>
  );
}
