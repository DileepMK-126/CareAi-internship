interface SkeletonCardProps { lines?: number; height?: string; }

export function SkeletonCard({ lines = 3, height = "h-4" }: SkeletonCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-pulse">
      <div className="h-4 w-1/3 bg-slate-200 rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`bg-slate-200 ${height} ${i === lines - 1 ? "w-2/3" : "w-full"} rounded`} />
      ))}
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />
      ))}
    </div>
  );
}
