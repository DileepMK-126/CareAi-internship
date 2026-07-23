import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "green" | "amber" | "red" | "purple";
  sub?: string;
}

const colorMap = {
  blue:   { bg: "bg-blue-600/10",   icon: "text-blue-400",   ring: "ring-blue-500/20"   },
  green:  { bg: "bg-green-600/10",  icon: "text-green-400",  ring: "ring-green-500/20"  },
  amber:  { bg: "bg-amber-600/10",  icon: "text-amber-400",  ring: "ring-amber-500/20"  },
  red:    { bg: "bg-red-600/10",    icon: "text-red-400",    ring: "ring-red-500/20"    },
  purple: { bg: "bg-purple-600/10", icon: "text-purple-400", ring: "ring-purple-500/20" },
};

export default function DashboardCard({ label, value, icon: Icon, color = "blue", sub }: DashboardCardProps) {
  const c = colorMap[color];
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-5 ring-1 ${c.ring} hover:border-gray-700 transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
