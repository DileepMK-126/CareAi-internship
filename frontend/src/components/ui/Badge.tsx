import React from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";
type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, { bg: string; text: string; border: string; dotBg: string }> = {
  success: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dotBg: "bg-emerald-500" },
  warning: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dotBg: "bg-amber-500" },
  danger:  { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dotBg: "bg-red-500" },
  info:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dotBg: "bg-blue-500" },
  neutral: { bg: "bg-slate-100",  text: "text-slate-700",   border: "border-slate-200",   dotBg: "bg-slate-400" },
};

export function Badge({ variant = "neutral", size = "sm", children, dot, className = "" }: BadgeProps) {
  const v = VARIANTS[variant];
  const sizeClasses = size === "md" ? "px-2.5 py-1 text-xs font-semibold" : "px-2 py-0.5 text-[11px] font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${v.bg} ${v.text} ${v.border} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`inline-block w-1.5 h-1.5 rounded-full ${v.dotBg}`} />}
      {children}
    </span>
  );
}
