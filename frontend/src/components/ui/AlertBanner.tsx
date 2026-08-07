import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
}

const CFG: Record<AlertVariant, { bg: string; border: string; icon: React.ElementType; iconColor: string; textColor: string }> = {
  error:   { bg: "bg-red-50",     border: "border-red-200",   icon: AlertCircle,   iconColor: "text-red-600",   textColor: "text-red-900" },
  success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle,   iconColor: "text-emerald-600", textColor: "text-emerald-900" },
  warning: { bg: "bg-amber-50",   border: "border-amber-200", icon: AlertTriangle, iconColor: "text-amber-600", textColor: "text-amber-900" },
  info:    { bg: "bg-blue-50",    border: "border-blue-200",  icon: Info,          iconColor: "text-blue-600",  textColor: "text-blue-900" },
};

export function AlertBanner({ variant = "info", title, message, dismissible = false }: AlertBannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const c = CFG[variant];
  const IconComp = c.icon;
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${c.bg} ${c.border} shadow-sm`}>
      <IconComp size={18} className={`${c.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-xs font-bold ${c.textColor} mb-0.5`}>{title}</p>}
        <p className={`text-xs ${c.textColor} leading-relaxed`}>{message}</p>
      </div>
      {dismissible && (
        <button onClick={() => setVisible(false)} className={`${c.iconColor} hover:opacity-70 flex-shrink-0 p-0.5`}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}
