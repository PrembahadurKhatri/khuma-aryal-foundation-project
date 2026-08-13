/** Simple pulsing placeholder grid shown briefly while content "loads" (see useContent). */
export default function Skeleton({ count = 3, className = "" }) {
  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
      ))}
    </div>
  );
}
